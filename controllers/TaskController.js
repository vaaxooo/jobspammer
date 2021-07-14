import db from '../config/db.js';
import amqp from "amqplib";
import fs from "fs";
import path from "path";

export class TaskController {

    /*#################################*/
    /*             INTERFACE           */

    /*#################################*/
    interfaceIndex(req, res) {
        db.query("SELECT * FROM `settings` WHERE `alias` = ? LIMIT ?", ['pagination_limit', 1], function (error_settings, settings) {
            if(error_settings || !settings) {
                res.render('error', {
                    title: "Not found alias `pagination_limit`",
                    description: "Please add to the alias `pagination_limit` `settings` section"
                });
                return;
            }

            let sort = req.query.sort ? req.query.sort : "o.id";
            let sort_type = req.query.sort_type ? req.query.sort_type : "ASC";
            let page = req.query.page;
            let limit = +settings[0].value;
            let offset = page > 1 ? ((limit * req.query.page || 1) - limit) : 0;
            db.query('SELECT o.*, o.id as "task_id", p.name as "portal_name", p.id FROM `order` as o JOIN `portal` as p ON p.id = o.portal ORDER BY ' + sort + ' ' + sort_type + ' LIMIT ?, ?',
                [offset, limit],
                (error, data) => {
                    db.query("SELECT COUNT(*) as 'count' FROM `order`", function (error, corder) {
                        if (!error) {
                            res.render('index', {
                                title: 'Tasks list',
                                user: req.session.User,
                                tasks: data,
                                total_tasks: corder[0].count,
                                total_current_tasks: data.length,
                                limit
                            });
                        }
                    });
                });
        });
    }

    interfaceAdd(req, res) {
        db.query("SELECT `id`, `alias` FROM `portal` WHERE `is_active` = ?", [1],
            (error_portals, data_portals) => {
                db.query("SELECT * FROM `proxy` WHERE `is_active`", [1], function (error_proxies, data_proxies) {
                    res.render('create_task', {
                        title: 'Create task',
                        user: req.session.User,
                        portals: data_portals,
                        proxies: data_proxies
                    })
                });
            });
    }

    interfaceStatistics(req, res) {
        let tasks = [];
        db.query("SELECT * FROM `order`", function (error, data) {
            tasks['data'] = data;
            tasks['total'] = data.length;
            tasks['created'] = data.filter(task => task.status_order === 0);
            tasks['done'] = data.filter(task => task.status_order === 1);
            tasks['fail'] = data.filter(task => task.status_order === 2);
            tasks['active'] = data.filter(task => task.status === 1);
            tasks['total_links'] = 0;
            tasks['send_links'] = 0;
            tasks['fail_links'] = 0;
            data.filter((total) => {
                tasks['total_links'] = +tasks['total_links'] + +total.all_links;
                tasks['send_links'] = +tasks['send_links'] + +total.send_links;
                tasks['fail_links'] = +tasks['fail_links'] + +total.fail_links;
            });
        });

        let portals = [];
        db.query("SELECT * FROM `portal`", function (error, data) {
            portals['data'] = data;
            portals['total'] = data.length;
            portals['active'] = data.filter(portal => portal.is_active === 1);
            portals['in_active'] = data.filter(portal => portal.is_active === 0);
        });

        let proxies = [];
        db.query("SELECT * FROM `proxy`", function (error, data) {
            proxies['data'] = data;
            proxies['total'] = data.length;
            proxies['active'] = data.filter(proxy => proxy.is_active === 1);
            proxies['in_active'] = data.filter(proxy => proxy.is_active === 0);
        });


        res.render('statistics', {
            title: 'Statistic',
            user: req.session.User,
            tasks,
            portals,
            proxies
        });

    }


    /*#################################*/
    /*             HANDLES             */

    /*#################################*/
    handlerAdd(req, res) {
        if (!req.files || !req.body.portal || !req.body.target_link || !req.body.email || !req.body.password) {
            res.send({
                status: false,
                message: 'Please fill in all required fields!'
            });
            return;
        }

        let file = req.files.file;

        if (file.mimetype !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && file.mimetype !== "application/msword"
            && file.mimetype !== "text/plain" && file.mimetype !== "application/octet-stream" && file.mimetype !== "application/pdf") {
            res.send({
                status: false,
                message: 'Only .docx, .doc, .rtf, .txt and .pdf format allowed!'
            });
            return;
        }

        file.mv("public/uploads/" + file.name).then(response => {
            fs.stat("public/uploads/" + file.name, function (error, stats) {
                if (error) {
                    res.send({
                        status: false,
                        message: 'File not uploaded!'
                    });
                } else {
                    let taskInfo = req.body;
                    let file_mailing = "uploads/" + file.name;
                    db.query("INSERT INTO `order` " +
                        "(`portal`, `user_name`, `last_name`, `email`, `password`, `target_link`, `file_mailing`) " +
                        "VALUES (?, ?, ?, ?, ?, ?, ?)", [taskInfo.portal, taskInfo.user_name, taskInfo.last_name, taskInfo.email, taskInfo.password, taskInfo.target_link, file_mailing],
                        function (error, data) {
                            if (error) {
                                res.send('Oops.. Data not saved!')
                            } else {

                                db.query("SELECT o.*, pr.*, p.alias FROM `order` as o JOIN `proxy` as pr ON o.id = ? JOIN `portal` as p ON p.id = o.portal LIMIT 1",
                                    [data.insertId], function (error, data) {
                                        const queue = process.env.QUEUE_NAME
                                        amqp.connect('amqp://' + process.env.RABBIT_HOST)
                                            .then(connection => {
                                                return connection.createChannel();
                                            }).then(channel => {
                                            channel.assertQueue(queue, {durable: true});
                                            channel.prefetch(1);
                                            console.log(" [x] Awaiting RPC Requests");

                                            let responseInfo = data[0];
                                            let query = JSON.stringify({
                                                is_update_proxy: true,
                                                target_link: responseInfo.target_link,
                                                order_id: responseInfo.id,
                                                file_mailing: responseInfo.file_mailing,
                                                file_name: file.name,
                                                user_name: responseInfo.user_name,
                                                last_name: responseInfo.last_name,
                                                email: responseInfo.email,
                                                password: responseInfo.password,
                                                portal: responseInfo.alias,
                                                proxy: {
                                                    proxy_id: responseInfo.proxy_id,
                                                    host: responseInfo.host_proxy,
                                                    port: responseInfo.port_proxy,
                                                    protocol: responseInfo.protocol_proxy,
                                                    username: responseInfo.username_proxy,
                                                    password: responseInfo.password_proxy
                                                }
                                            });
                                            channel.sendToQueue(queue, new Buffer(query.toString()));
                                        });

                                        res.send({
                                            status: true,
                                            message: "Task has been created!"
                                        });
                                    });

                            }
                        });
                }
            });
        });
    }

    handlerRestart(req, res) {
        db.query("SELECT `id` FROM `order` WHERE `id` = ? LIMIT ?", [req.body.task_id, 1],
            (error, data) => {
                if (error || data === undefined) {
                    res.send({
                        status: false,
                        message: "Oops.. Something went wrong!"
                    });
                    return;
                }
                db.query("UPDATE `order` SET `status_order` = ?, `status` = ? WHERE `id` = ?", [0, 1, req.body.task_id], function (error, data) {
                    if (error) {
                        res.send({
                            status: false,
                            message: "Oops.. Something went wrong!"
                        });
                        return;
                    }

                    db.query("SELECT o.*, o.id as 'task_id', pr.proxy_id, pr.protocol_proxy, pr.host_proxy, pr.port_proxy, pr.username_proxy, pr.password_proxy, pr.fail_request_proxy, p.alias, s.alias as 'settings_alias', s.is_active " +
                        "FROM `order` as o " +
                        "JOIN `proxy` as pr ON o.id = ?" +
                        "JOIN `settings` as s ON s.alias = 'is_update_proxy' " +
                        "JOIN `portal` as p ON p.id = o.portal LIMIT 1",
                        [req.body.task_id], function (error, data) {
                            const queue = process.env.QUEUE_NAME
                            amqp.connect('amqp://' + process.env.RABBIT_HOST)
                                .then(connection => {
                                    return connection.createChannel();
                                }).then(channel => {
                                channel.assertQueue(queue, {durable: true});
                                channel.prefetch(1);
                                console.log(" [x] Awaiting RPC Requests");

                                let responseInfo = data[0];
                                let query = JSON.stringify({
                                    is_update_proxy: responseInfo.is_active ? true : false,
                                    target_link: responseInfo.target_link,
                                    order_id: responseInfo.id,
                                    file_mailing: responseInfo.file_mailing,
                                    file_name: path.basename(responseInfo.file_mailing),
                                    user_name: responseInfo.user_name,
                                    last_name: responseInfo.last_name,
                                    email: responseInfo.email,
                                    password: responseInfo.password,
                                    portal: responseInfo.alias,
                                    proxy: {
                                        proxy_id: responseInfo.proxy_id,
                                        host: responseInfo.host_proxy,
                                        port: responseInfo.port_proxy,
                                        protocol: responseInfo.protocol_proxy,
                                        username: responseInfo.username_proxy,
                                        password: responseInfo.password_proxy
                                    }
                                });
                                channel.sendToQueue(queue, new Buffer(query.toString()));
                            });


                            res.send({
                                status: true,
                                message: "Task restarted!"
                            });
                        });

                });

            });
    }

}