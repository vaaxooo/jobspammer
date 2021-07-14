import db from '../config/db.js';
import fs from "fs";

export class ApiController {


    /*#################################*/
    /*             HANDLES             */
    /*#################################*/
    handlerGetFile(req, res) {
        let file_url = req.query.file_url;
        if (file_url === undefined) {
            res.send({
                status: false,
                message: "Params: [file_url] not found!"
            });
            return;
        }
        fs.stat("./public/" + file_url, function (error, stats) {
            if (error || stats.isFile() === false) {
                res.send({
                    status: false,
                    message: 'Incorrect file path!'
                });
                return;
            }
        });
        db.query("SELECT * FROM `order` WHERE `file_mailing` = ?", [file_url],
            function (error, data) {
                if (!data) {
                    res.send({
                        status: false,
                        message: 'File not found!'
                    });
                    return;
                }

                let filePath = "./public/" + file_url;
                res.download(filePath);
            });
    }

    handlerOrderFail(req, res) {
        db.query("UPDATE `order` SET `status_order` = ?, `status` = ?, `message` = ? WHERE `id` = ?", [2, 0, req.body.message, req.params.task_id]);
        db.query("UPDATE `proxy` SET `fail_request_proxy` = `fail_request_proxy` + 1 WHERE `proxy_id` = ?", [req.body.proxy_id]);
        res.send({
            status: true,
            message: "Data refreshed!",
        })
    }

    handlerOrderSuccess(req, res) {
        db.query("UPDATE `order` SET `status_order` = ?, `status` = ?, `all_links` = ?, `send_links` = ?, `fail_links` = ?, `message` = ? WHERE `id` = ?",
            [1, 0, req.body.all_links, req.body.send_links, req.body.fail_links, "Task completed successfully", req.params.task_id]);
        res.send({
            status: true,
            message: "Data refreshed!"
        })
    }

    handlerProxyUpdate(req, res, next) {
        if (req.query.fail === "true") {
            db.query("UPDATE `proxy` SET `fail_request_proxy` = `fail_request_proxy` + 1 WHERE `proxy_id` = ?",
                [req.query.proxy_id], function (error, data) {
                    if (error) {
                        res.send({
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
                    res.send({
                        status: false,
                        message: "An error occurred while updating the data!"
                    });
                    return;
                }

                let proxy = data[0];
                if(proxy) {
                    res.send({
                        status: true,
                        proxy: "http://" + proxy.username_proxy + ":" + proxy.password_proxy + "@" + proxy.host_proxy + ":" + proxy.port_proxy,
                        proxy_id: proxy.proxy_id
                    });
                    return;
                }

                db.query("SELECT * FROM `proxy` WHERE `proxy_id` = ? LIMIT ?",
                    [req.query.proxy_id, 1], function (error_proxy, proxy) {
                        res.send({
                            status: true,
                            proxy: "http://" + proxy[0].username_proxy + ":" + proxy[0].password_proxy + "@" + proxy[0].host_proxy + ":" + proxy[0].port_proxy,
                            proxy_id: proxy[0].proxy_id
                        });
                    });


            });
    }

}