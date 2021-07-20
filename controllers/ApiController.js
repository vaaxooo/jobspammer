import fs from "fs";
import SOP from 'sequelize';
import sequelize from '../config/db.js';

const {Op} = SOP;

//MODELS
import Orders from '../models/Orders.js';
import Proxies from '../models/Proxies.js';

export class ApiController {


    /*#################################*/
    /*             HANDLES             */

    /*#################################*/
    async handlerGetFile(req, res) {
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
        const Order = await Orders.findOne({
            where: {
                file_mailing: file_url
            }
        });
        if (!Order) {
            res.send({
                status: false,
                message: 'File not found!'
            });
            return;
        }
        let filePath = "./public/" + file_url;
        res.download(filePath);
    }

    async handlerOrderFail(req, res) {
        Orders.update({
            status_order: 2,
            status: 0,
            message: req.body.message
        }, {
            where: {
                id: req.params.task_id
            }
        });
        Proxies.increment('fail_request_proxy', {
            where: {
                proxy_id: req.body.proxy_id
            }
        })
        res.send({
            status: true,
            message: "Data refreshed!",
        })
    }

    async handlerOrderSuccess(req, res) {
        await Orders.update({
            status_order: 1,
            status: 0,
            all_links: req.body.all_links,
            send_links: req.body.send_links,
            fail_links: req.body.fail_links,
            message: "Task completed successfully"
        }, {
            where: {
                id: req.params.task_id
            }
        });
        res.send({
            status: true,
            message: "Data refreshed!"
        })
    }

    async handlerProxyUpdate(req, res, next) {
        if (req.query.fail === "true") {
            let response;
            await Proxies.increment('fail_request_proxy', {
                where: {
                    proxy_id: req.query.proxy_id
                }
            });
            if (response === null) {
                res.send({
                    status: false,
                    message: "An error occurred while updating the data!"
                });
                return;
            }
        }
        let Proxy;
        Proxy = await Proxies.findOne({
            attributes: [
                'proxy_id',
                'protocol_proxy',
                'host_proxy',
                'port_proxy',
                'username_proxy',
                'password_proxy',
                'is_active'
            ],
            where: {
                is_active: 1,
                proxy_id: {
                    [Op.not]: req.query.proxy_id
                }
            },
            order: sequelize.random(),
        });
        if (Proxy === null) {
            res.send({
                status: false,
                message: "An error occurred while updating the data!"
            });
            return;
        }
        if (Proxy) {
            res.send({
                status: true,
                proxy: "http://" + Proxy.username_proxy + ":" + Proxy.password_proxy + "@" + Proxy.host_proxy + ":" + Proxy.port_proxy,
                proxy_id: Proxy.proxy_id
            });
            return;
        }
        Proxy = await Proxies.findOne({
            proxy_id: req.query.proxy_id
        });
        res.send({
            status: true,
            proxy: "http://" + Proxy.username_proxy + ":" + Proxy.password_proxy + "@" + Proxy.host_proxy + ":" + Proxy.port_proxy,
            proxy_id: Proxy.proxy_id
        });
    }

}