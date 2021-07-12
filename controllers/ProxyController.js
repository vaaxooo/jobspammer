import db from '../config/db.js';

export class ProxyController {

    /*#################################*/
    /*             INTERFACE           */
    /*#################################*/
    interfaceIndex(req, res) {
        db.query("SELECT * FROM `proxy`",
            (error, data) => {
                if (!error) {
                    res.render('proxy/index', {
                        title: 'Proxy list',
                        proxy: data
                    })
                }
            });
    }

    interfaceAdd(req, res) {
        res.render('proxy/add', {
            title: 'Adding a new proxy'
        });
    }

    interfaceEdit(req, res) {
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
    }


    /*#################################*/
    /*             HANDLES             */
    /*#################################*/
    handlerIndex(req, res) {
        let status = req.body.status === 'in_active' ? 0 : 1;
        db.query("UPDATE `proxy` SET `is_active` = ? WHERE `proxy_id` = ?", [status, req.body.proxy_id],
            (error, data) => {
                if (error) {
                    res.send({
                        status: false,
                    });
                    return;
                }

                res.send({
                    status: true,
                });

            });
    }

    handlerAdd(req, res) {
        console.log(req.body);
        if (!req.body.protocol_proxy || !req.body.host_proxy || !req.body.port_proxy || !req.body.email || !req.body.username_proxy || !req.body.password_proxy) {
            res.send({
                status: false,
                message: 'Please fill in all required fields!'
            })
            return;
        }

        db.query("INSERT INTO `proxy` (`protocol_proxy`, `host_proxy`, `port_proxy`, `username_proxy`, `password_proxy`) VALUES " +
            "(?, ?, ?, ?, ?)", [req.body.protocol_proxy, req.body.host_proxy, req.body.port_proxy, req.body.username_proxy, req.body.password_proxy],
            function (error, data) {
                if (error) {
                    res.send({
                        status: false,
                        message: "Oops. Data not saved!"
                    });
                    return;
                }

                res.send({
                    status: true,
                    message: "Data saved!"
                });
            });
    }

    handlerEdit(req, res) {

        if (!req.body.protocol_proxy || !req.body.host_proxy || !req.body.port_proxy || !req.body.email || !req.body.username_proxy || !req.body.password_proxy) {
            res.send({
                status: false,
                message: 'Please fill in all required fields!'
            })
            return;
        }

        db.query("UPDATE `proxy` SET `protocol_proxy` = ?, `host_proxy` = ?, `port_proxy` = ?, `username_proxy` = ?, `password_proxy` = ? WHERE `proxy_id` = ?",
            [req.body.protocol_proxy, req.body.host_proxy, req.body.port_proxy, req.body.username_proxy, req.body.password_proxy, req.body.proxy_id],
            function (error, data) {
                if (error || Object.keys(data).length === 0) {
                    res.send({
                        status: false,
                        message: "Proxy ID not found!"
                    });
                    return;
                }

                res.send({
                    status: true,
                    message: "Data refreshed!"
                })
            });
    }

}