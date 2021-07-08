const http = require('http');
const express = require('express');
const fs = require("fs");
const path = require('path');
const multer = require('multer');
const amqp = require('amqplib');

const router = express.Router();
let db = require('./db.js');
let storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'public/uploads/');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
let upload = multer({storage});

/**
 * ROUTE INTERFACE
 * MAIN PAGE
 */
router.get('/', (req, res) => {
    db.query("SELECT o.*, p.alias, p.is_active FROM `order` as o JOIN `portal` as p ON o.portal = p.id",
        (error, data) => {
            if (!error) {
                res.render('index', {
                    title: 'Task list',
                    tasks: data
                });
            }
        });
});

/**
 * ROUTE HANDLER
 * UPDATE SETTINGS TASK STATUS
 */
router.post('/settings/index', upload.none(), (req, res) => {
    let status = req.body.status === 'in_active' ? 0 : 1;
    db.query("UPDATE `settings` SET `is_active` = ? WHERE `id` = ?", [status, req.body.settings_id],
        (error, data) => {
            if (!error) {
                res.json({
                    success: true,
                });
                return;
            }
        });
});

/**
 * ROUTE HANDLER
 * UPDATE PORTAL TASK STATUS
 */
router.post('/portal/index', upload.none(), (req, res) => {
    let status = req.body.status === 'in_active' ? 0 : 1;
    db.query("UPDATE `portal` SET `is_active` = ? WHERE `id` = ?", [status, req.body.portal_id],
        (error, data) => {
            if (!error) {
                res.json({
                    success: true,
                });
                return;
            }
        });
});

/**
 * ROUTE INTERFACE
 * CREATE TASK ROUTE
 */
router.get('/create_task', (req, res) => {
    db.query("SELECT `id`, `alias` FROM `portal` WHERE `is_active` = ?", [1],
        (error, data) => {
            if (!error) {
                res.render('create_task', {
                    title: 'Create task',
                    portals: data
                })
            }
        });
});

/**
 * ROUTE INTERFACE
 * SETTINGS PAGE
 */
router.get('/settings/index', (req, res) => {
    db.query("SELECT * FROM `settings`",
        (error, data) => {
            if (!error) {
                res.render('settings/index', {
                    title: 'Settings',
                    settings: data
                });
            }
        });
});

/**
 * ROUTE INTERFACE
 * PORTAL PAGE
 */
router.get('/portal/index', (req, res) => {
    db.query("SELECT * FROM `portal`",
        (error, data) => {
            if (!error) {
                res.render('portal/index', {
                    title: 'Portal',
                    portal: data
                });
            }
        });
});

/**
 * ROUTE INTERFACE
 * SETTINGS ADD PAGE
 */
router.get('/settings/add', (req, res) => {
    res.render('settings/add', {
        title: 'Add new alias'
    });
});

/**
 * ROUTE INTERFACE
 * PORTAL ADD PAGE
 */
router.get('/portal/add', (req, res) => {
    res.render('portal/add', {
        title: 'Add new portal'
    });
});

/**
 * ROUTE HANDLER PORTAL ADD
 */
router.post('/portal/add', upload.none(), (req, res) => {
    db.query("INSERT INTO `portal` (`alias`, `is_active`) VALUES " +
        "(?, ?)", [req.body.alias, req.body.is_active],
        function (error, data) {
            if (error) {
                res.json({
                    success: false,
                    message: "Oops. Data not saved!"
                });
                return;
            }

            res.json({
                success: true,
                message: "Data saved!"
            });
        });
});

/**
 * ROUTE HANDLER
 * RESTART TASK ROUTE
 */
router.post('/tasks/restart', upload.none(), (req, res) => {
    db.query("SELECT `id` FROM `order` WHERE `id` = ? LIMIT ?", [req.body.task_id, 1],
        (error, data) => {
            if (error || data === undefined) {
                res.json({
                    status: false,
                    message: "Oops.. Something went wrong!"
                })
                return;
            }
            db.query("UPDATE `order` SET `status_order` = ?, `status` = ? WHERE `id` = ?", [0, 1, req.body.task_id], function (error, data) {
                if (error) {
                    res.json({
                        status: false,
                        message: "Oops.. Something went wrong!"
                    })
                    return;
                }

                db.query("SELECT o.*, pr.proxy_id, pr.protocol_proxy, pr.host_proxy, pr.port_proxy, pr.username_proxy, pr.password_proxy, pr.fail_request_proxy, p.alias, s.alias as 'settings_alias', s.is_active " +
                    "FROM `order` as o " +
                    "JOIN `proxy` as pr ON o.id = 14 " +
                    "JOIN `settings` as s ON s.alias = 'is_update_proxy' " +
                    "JOIN `portal` as p ON p.id = o.portal LIMIT 1",
                    [req.body.task_id], function (error, data) {
                        const queue = process.env.QUEUE_NAME
                        amqp.connect('amqp://' + process.env.RABBIT_HOST)
                            .then(connection => {
                                return connection.createChannel();
                            }).then(channel => {
                            channel.assertQueue(queue);
                            channel.prefetch(1);
                            console.log(" [x] Awaiting RPC Requests");

                            let responseInfo = data[0];
                            let query = JSON.stringify({
                                is_update_proxy: responseInfo.is_active ? true : false,
                                target_link: responseInfo.target_link,
                                order_id: responseInfo.id,
                                file_mailing: responseInfo.file_mailing,
                                user_name: responseInfo.user_name,
                                last_name: responseInfo.last_name,
                                email: responseInfo.email,
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
});

/**
 * ROUTE HANDLER
 * CREATE TASK ROUTE [POST]
 */
router.post('/create_task', upload.single('file'), (req, res) => {
    if (!req.file) {
        res.json({
            status: false,
            message: 'Not uploaded file!'
        })
        return;
    }

    fs.stat("public/uploads/" + req.file.originalname, function (error, stats) {
        if (error) {
            res.json({
                status: false,
                message: 'File not uploaded!'
            });
        } else {
            let taskInfo = req.body;
            let file_mailing = "uploads/" + req.file.originalname;
            db.query("INSERT INTO `order` " +
                "(`portal`, `user_name`, `last_name`, `email`, `password`, `target_link`, `file_mailing`) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)", [taskInfo.portal, taskInfo.user_name, taskInfo.last_name, taskInfo.email, taskInfo.password, taskInfo.target_link, file_mailing],
                function (error, data) {
                    if (error) {
                        res.json('Oops.. Data not saved!')
                    } else {

                        db.query("SELECT o.*, pr.*, p.alias FROM `order` as o JOIN `proxy` as pr ON o.id = ? JOIN `portal` as p ON p.id = o.portal LIMIT 1",
                            [data.insertId], function (error, data) {
                                const queue = process.env.QUEUE_NAME
                                amqp.connect('amqp://' + process.env.RABBIT_HOST)
                                    .then(connection => {
                                        return connection.createChannel();
                                    }).then(channel => {
                                    channel.assertQueue(queue);
                                    channel.prefetch(1);
                                    console.log(" [x] Awaiting RPC Requests");

                                    let responseInfo = data[0];
                                    let query = JSON.stringify({
                                        is_update_proxy: true,
                                        target_link: responseInfo.target_link,
                                        order_id: responseInfo.id,
                                        file_mailing: responseInfo.file_mailing,
                                        user_name: responseInfo.user_name,
                                        last_name: responseInfo.last_name,
                                        email: responseInfo.email,
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
                            });

                    }
                });
        }
    });
});


/**
 * ROUTE INTERFACE PROXY
 */
router.get('/proxy/index', (req, res) => {
    db.query("SELECT * FROM `proxy`",
        (error, data) => {
            if (!error) {
                res.render('proxy/index', {
                    title: 'Proxy list',
                    proxy: data
                })
            }
        });
});

/**
 * ROUTE HANDLER
 * CHANGE PROXY STATUS [is_active]
 */
router.post('/proxy/index', upload.none(), (req, res) => {
    let status = req.body.status === 'in_active' ? 0 : 1;
    db.query("UPDATE `proxy` SET `is_active` = ? WHERE `proxy_id` = ?", [status, req.body.proxy_id],
        (error, data) => {
            if (error) {
                res.json({
                    success: false,
                });
                return;
            }

            res.json({
                success: true,
            });

        });
});

/**
 * ROUTE INTERFACE PROXY ADD
 */
router.get('/proxy/add', upload.none(), (req, res) => {
    res.render('proxy/add', {
        title: 'Adding a new proxy'
    });
});

/**
 * ROUTE INTERFACE SETTINGS EDIT
 */
router.get('/settings/alias/:settings_id', upload.none(), (req, res) => {
    db.query("SELECT * FROM `settings` WHERE `id` = ? LIMIT ?", [req.params.settings_id, 1], function (error, data) {
        if (error || Object.keys(data).length === 0) {
            res.json({
                status: false,
                message: "Alias ID not found!"
            });
            return;
        }

        res.render('settings/edit', {
            title: 'Edit alias ' + data[0].alias,
            settings: data[0]
        });
    });
});

/**
 * ROUTE HANDLER SETTINGS EDIT
 */
router.post('/settings/alias', upload.none(), (req, res) => {
    db.query("UPDATE `settings` SET `alias` = ?, `description` = ? WHERE `id` = ?",
        [req.body.alias, req.body.description, req.body.settings_id],
        function (error, data) {
            if (error || Object.keys(data).length === 0) {
                res.json({
                    status: false,
                    message: "Settings ID not found!"
                });
                return;
            }

            res.json({
                status: true,
                message: "Data refreshed!"
            })
        });
});


/**
 * ROUTE INTERFACE PORTAL EDIT
 */
router.get('/portal/edit/:portal_id', upload.none(), (req, res) => {
    db.query("SELECT * FROM `portal` WHERE `id` = ? LIMIT ?", [req.params.portal_id, 1], function (error, data) {
        if (error || Object.keys(data).length === 0) {
            res.json({
                status: false,
                message: "Portal ID not found!"
            });
            return;
        }

        res.render('portal/edit', {
            title: 'Edit portal ' + data[0].alias,
            portal: data[0]
        });
    });
});

/**
 * ROUTE HANDLER PORTAL EDIT
 */
router.post('/portal/edit', upload.none(), (req, res) => {
    db.query("UPDATE `portal` SET `alias` = ? WHERE `id` = ?",
        [req.body.alias, req.body.portal_id],
        function (error, data) {
            if (error || Object.keys(data).length === 0) {
                res.json({
                    status: false,
                    message: "Portal ID not found!"
                });
                return;
            }

            res.json({
                status: true,
                message: "Data refreshed!"
            })
        });
});


/**
 * ROUTE INTERFACE PROXY EDIT
 */
router.get('/proxy/edit/:proxy_id', upload.none(), (req, res) => {
    db.query("SELECT * FROM `proxy` WHERE `proxy_id` = ? LIMIT ?", [req.params.proxy_id, 1], function (error, data) {
        if (error || Object.keys(data).length === 0) {
            res.send({
                status: false,
                message: "Proxy ID not found!"
            });
            return;
        }

        res.render('proxy/edit', {
            title: 'Edit proxy ' + data[0].host_proxy + ":" + data[0].port_proxy,
            proxy: data[0]
        });
    });
});


/**
 * ROUTE HANDLER PROXY EDIT
 */
router.post('/proxy/edit/', upload.none(), (req, res) => {
    db.query("UPDATE `proxy` SET `protocol_proxy` = ?, `host_proxy` = ?, `port_proxy` = ?, `username_proxy` = ?, `password_proxy` = ? WHERE `proxy_id` = ?",
        [req.body.protocol_proxy, req.body.host_proxy, req.body.port_proxy, req.body.username_proxy, req.body.password_proxy, req.body.proxy_id],
        function (error, data) {
            if (error || Object.keys(data).length === 0) {
                res.json({
                    status: false,
                    message: "Proxy ID not found!"
                });
                return;
            }

            res.json({
                status: true,
                message: "Data refreshed!"
            })
        });
});

/**
 * ROUTE HANDLER PROXY ADD
 */
router.post('/proxy/add', upload.none(), (req, res) => {
    db.query("INSERT INTO `proxy` (`protocol_proxy`, `host_proxy`, `port_proxy`, `username_proxy`, `password_proxy`) VALUES " +
        "(?, ?, ?, ?, ?)", [req.body.protocol_proxy, req.body.host_proxy, req.body.port_proxy, req.body.username_proxy, req.body.password_proxy],
        function (error, data) {
            if (error) {
                res.json({
                    success: false,
                    message: "Oops. Data not saved!"
                });
                return;
            }

            res.json({
                success: true,
                message: "Data saved!"
            });
        });
});

/**
 * ROUTE HANDLER SETTINGS ADD
 */
router.post('/settings/add', upload.none(), (req, res) => {
    db.query("INSERT INTO `settings` (`alias`, `is_active`, `description`) VALUES " +
        "(?, ?, ?)", [req.body.alias, req.body.is_active, req.body.description],
        function (error, data) {
            if (error) {
                res.json({
                    success: false,
                    message: "Oops. Data not saved!"
                });
                return;
            }

            res.json({
                success: true,
                message: "Data saved!"
            });
        });
});

/**
 * ROUTE HANDLER
 * API REQUESTS
 */
router.get('/mainsystem/bot/get_file/', (req, res) => {
    let file_url = req.query.file_url;
    if (file_url === undefined) {
        res.json({
            status: false,
            message: "Params: [file_url] not found!"
        });
        return;
    }
    fs.stat("./public/" + file_url, function (error, stats) {
        if (error || stats.isFile() === false) {
            res.json({
                status: false,
                message: 'Incorrect file path!'
            });
            return;
        }
    });
    db.query("SELECT * FROM `order` WHERE `file_mailing` = ?", [file_url],
        function (error, data) {
            if (!data) {
                res.json({
                    status: false,
                    message: 'File not found!'
                });
                return;
            }

            let filePath = "./public/" + file_url;
            res.download(filePath);
        });
});

/**
 * API FAIL
 */
router.post('/mainsystem/api/order/:task_id/fail/', upload.none(), (req, res) => {

    db.query("UPDATE `order` SET `status_order` = ?, `status` = ?, `message` = ? WHERE `id` = ?", [2, 0, req.body.message, req.params.task_id]);
    db.query("UPDATE `proxy` SET `fail_request_proxy` = `fail_request_proxy` + 1 WHERE `proxy_id` = ?", [req.body.proxy_id]);

    res.json({
        status: true,
        message: "Data refreshed!"
    })
});

/**
 * API SUCCESS
 */
router.post('/mainsystem/api/order/:task_id/success/', upload.none(), (req, res) => {

    db.query("UPDATE `order` SET `status_order` = ?, `status` = ?, `all_links` = ?, `send_links` = ?, `fail_links` = ?, `message` = ? WHERE `id` = ?",
        [1, 1, req.body.all_links, req.body.send_links, req.body.fail_links, "Task completed successfully", req.params.task_id]);
    /*    db.query("UPDATE `proxy` SET `success_request_proxy` = `success_request_proxy` + 1 WHERE `proxy_id` = ?",
            [req.body.proxy_id]);*/

    res.json({
        status: true,
        message: "Data refreshed!"
    })
});

/**
 * API UPDATE PROXY
 */
router.get('/mainsystem/proxy/update/', upload.none(), (req, res) => {

    if (req.query.fail === "true") {
        db.query("UPDATE `proxy` SET `fail_request_proxy` = `fail_request_proxy` + 1 WHERE `proxy_id` = ?",
            [req.query.proxy_id], function (error, data) {
                if (error) {
                    res.json({
                        status: false,
                        message: "An error occurred while updating the data!"
                    });
                    return;
                }
            });
    }

    db.query("SELECT `proxy_id`, `protocol_proxy`, `host_proxy`, `port_proxy`, `username_proxy`, `password_proxy`, `is_active`" +
        " FROM `proxy` WHERE `is_active` = ? AND NOT `proxy_id` = ? ORDER BY RAND() LIMIT ?",
        [1, req.query.proxy_id, 1], function (error, data) {
            if (error) {
                res.json({
                    status: false,
                    message: "An error occurred while updating the data!"
                });
                return;
            }

            let proxy = data[0];
            res.json({
                status: true,
                proxy: "http://" + proxy.username_proxy + ":" + proxy.password_proxy + "@" + proxy.host_proxy + ":" + proxy.port_proxy,
                proxy_id: proxy.proxy_id
            });
        });
});

module.exports = router;