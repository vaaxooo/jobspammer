import amqp from "amqplib";
import fs from "fs";
import path from "path";

import SOP from "sequelize";
import sequelize from '../config/db.js';

import Settings from '../models/Settings.js';
import Orders from '../models/Orders.js';
import Portals from '../models/Portals.js';
import Proxies from '../models/Proxies.js';

let {OP} = SOP;

export class TaskController {

    /*#################################*/
    /*             INTERFACE           */

    /*#################################*/
    async interfaceIndex(req, res) {
        const SettingsResponse = await Settings.findOne({
            where: {
                alias: 'pagination_limit'
            }
        });
        if (SettingsResponse === null) {
            res.render('error', {
                title: "Not found alias `pagination_limit`",
                description: "Please add to the alias `pagination_limit` `settings` section"
            });
            return;
        }
        let sort = req.query.sort ? req.query.sort : "o.id";
        let sort_type = req.query.sort_type ? req.query.sort_type : "ASC";
        let page = req.query.page;
        let limit = +SettingsResponse.value;
        let offset = page > 1 ? ((limit * req.query.page || 1) - limit) : 0;
        const Order = await sequelize.query('SELECT o.*, o.id as "task_id", p.name as "portal_name", p.id FROM `order` as o JOIN `portal` as p ON p.id = o.portal ORDER BY ' + sort + ' ' + sort_type + ' LIMIT ?, ?', {
           replacements: [offset, limit]
        });
        const OrdersCount = await Orders.count({});
        res.render('index', {
            title: 'Tasks list',
            user: req.session.User,
            tasks: Order[0],
            total_tasks: OrdersCount,
            total_current_tasks: Order.length,
            limit
        });

    }

    async interfaceAdd(req, res) {
        const PortalsData = await Portals.findAll({
            attributes: ['id', 'alias'],
            where: {
                is_active: 1
            }
        });
        const ProxiesCount = await Proxies.count({
            where: {
                is_active: 1
            }
        });
        res.render('create_task', {
            title: 'Create task',
            user: req.session.User,
            portals: PortalsData.map(data => data.toJSON()),
            proxies: ProxiesCount
        })
    }


    async interfaceStatistics(req, res) {
        let tasks = [];
        let OrdersData = await Orders.findAll();

        tasks['data'] = OrdersData;
        tasks['total'] = OrdersData.length;
        tasks['created'] = OrdersData.filter(task => task.status_order === false);
        tasks['done'] = OrdersData.filter(task => task.status_order === true);
        tasks['fail'] = OrdersData.filter(task => task.status_order === 2);
        tasks['active'] = OrdersData.filter(task => task.status === true);
        tasks['total_links'] = 0;
        tasks['send_links'] = 0;
        tasks['fail_links'] = 0;
        OrdersData.filter((total) => {
            tasks['total_links'] = +tasks['total_links'] + +total.all_links;
            tasks['send_links'] = +tasks['send_links'] + +total.send_links;
            tasks['fail_links'] = +tasks['fail_links'] + +total.fail_links;
        });

        let portals = [];
        const PortalsData = await Portals.findAll();
        portals['data'] = PortalsData;
        portals['total'] = PortalsData.length;
        portals['active'] = PortalsData.filter(portal => portal.is_active === 1);
        portals['in_active'] = PortalsData.filter(portal => portal.is_active === 0);

        let proxies = [];
        const ProxiesData = await Proxies.findAll();
        proxies['data'] = ProxiesData;
        proxies['total'] = ProxiesData.length;
        proxies['active'] = ProxiesData.filter(proxy => proxy.is_active === true);
        proxies['in_active'] = ProxiesData.filter(proxy => proxy.is_active === false);


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
    async handlerAdd(req, res) {
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
                    return false;
                }
                let taskInfo = req.body;
                let file_mailing = "uploads/" + file.name;
                const Order = Orders.create({
                   portal: taskInfo.portal,
                   user_name: taskInfo.user_name,
                   last_name: taskInfo.last_name,
                   email: taskInfo.email,
                   password: taskInfo.password,
                   target_link: taskInfo.target_link,
                   file_mailing: file_mailing,
                });
                if (Order) {
                    res.send({
                        status: false,
                        message: 'Oops.. Data not saved!'
                    })
                }
                const Proxy = Proxies.findOne({
                    where: {
                        is_active: 1
                    },
                    order: sequelize.random()
                });
                const Portal = Portals.findOne({
                    attributes: ['id', 'alias', 'name'],
                    where: {
                        id: Order.portal
                    }
                })

                const queue = process.env.QUEUE_NAME
                amqp.connect('amqp://' + process.env.RABBIT_HOST)
                    .then(connection => {
                        return connection.createChannel();
                    }).then(channel => {
                    channel.assertQueue(queue, {durable: true});
                    channel.prefetch(1);
                    console.log(" [x] Awaiting RPC Requests");

                    let query = JSON.stringify({
                        is_update_proxy: true,
                        target_link: Order.target_link,
                        order_id: Order.id,
                        file_mailing: Order.file_mailing,
                        file_name: file.name,
                        user_name: Order.user_name,
                        last_name: Order.last_name,
                        email: Order.email,
                        password: Order.password,
                        portal: Portal.alias,
                        proxy: {
                            proxy_id: Proxy.proxy_id,
                            host: Proxy.host_proxy,
                            port: Proxy.port_proxy,
                            protocol: Proxy.protocol_proxy,
                            username: Proxy.username_proxy,
                            password: Proxy.password_proxy
                        }
                    });
                    channel.sendToQueue(queue, new Buffer(query.toString()));
                });

                res.send({
                    status: true,
                    message: "Task has been created!"
                });

            });
        });
    }

    async handlerRestart(req, res) {
        const OrderData = await Orders.findOne({
            where: {
                id: req.body.task_id
            }
        });
        if (OrderData === null) {
            res.send({
                status: false,
                message: "Oops.. Something went wrong!"
            });
            return;
        }
        await Orders.update({
            status_order: 0,
            status: 1
        }, {
            where: {
                id: req.body.task_id
            }
        });
        const Data = await sequelize.query("SELECT o.*, o.id as 'task_id', pr.proxy_id, pr.protocol_proxy, pr.host_proxy, pr.port_proxy, pr.username_proxy, pr.password_proxy, pr.fail_request_proxy, p.alias, s.alias as 'settings_alias', s.is_active " +
            "FROM `order` as o " +
            "JOIN `proxy` as pr ON o.id = ?" +
            "JOIN `settings` as s ON s.alias = 'is_update_proxy' " +
            "JOIN `portal` as p ON p.id = o.portal LIMIT 1",
            {
                replacements: [req.body.task_id]
            });
            const queue = process.env.QUEUE_NAME
            amqp.connect('amqp://' + process.env.RABBIT_HOST)
                .then(connection => {
                    return connection.createChannel();
                }).then(channel => {
                channel.assertQueue(queue, {durable: true});
                channel.prefetch(1);
                console.log(" [x] Awaiting RPC Requests");

                let responseInfo = Data[0];
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


    }

}