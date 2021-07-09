import db from '../config/db.js';
import amqp from "amqplib";
import fs from "fs";
import path from "path";

export class TaskController {

    /*#################################*/
    /*             INTERFACE           */
    /*#################################*/
    interfaceIndex(req, res) {
        db.query('SELECT o.*, p.name as "portal_name", p.id FROM `order` as o JOIN `portal` as p ON p.id = o.portal',
            (error, data) => {
                if (!error) {
                    res.render('index', {
                        title: 'Tasks list',
                        tasks: data
                    });
                }
            });
    }

    interfaceAdd(req, res) {
        db.query("SELECT `id`, `alias` FROM `portal` WHERE `is_active` = ?", [1],
            (error, data) => {
                if (!error) {
                    res.render('create_task', {
                        title: 'Create task',
                        portals: data
                    })
                }
            });
    }


    /*#################################*/
    /*             HANDLES             */
    /*#################################*/
    handlerAdd(req, res) {
        if (!req.files.file || !req.body.portal || !req.body.target_link || !req.body.email || !req.body.password) {
            res.send({
                status: false,
                message: 'Please fill in all required fields!'
            })
            return;
        }

        let file = req.files.file;

        if(file.mimetype !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && file.mimetype !== "application/msword"
            && file.mimetype !== "text/plain" && file.mimetype !== "application/octet-stream" && file.mimetype !== "application/pdf") {
            res.send({
                status: false,
                message: 'Only .docx, .doc, .rtf, .txt and .pdf format allowed!'
            })
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
                                        })
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
                    })
                    return;
                }
                db.query("UPDATE `order` SET `status_order` = ?, `status` = ? WHERE `id` = ?", [0, 1, req.body.task_id], function (error, data) {
                    if (error) {
                        res.send({
                            status: false,
                            message: "Oops.. Something went wrong!"
                        })
                        return;
                    }

                    db.query("SELECT o.*, pr.proxy_id, pr.protocol_proxy, pr.host_proxy, pr.port_proxy, pr.username_proxy, pr.password_proxy, pr.fail_request_proxy, p.alias, s.alias as 'settings_alias', s.is_active " +
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
                            })
                        });

                });

            });
    }

}