import db from '../config/db.js';

import Settings from '../models/Settings.js';
import Proxies from '../models/Proxies.js';

export class ProxyController {

    /*#################################*/
    /*             INTERFACE           */
    /*#################################*/
    async interfaceIndex(req, res) {
        const SettingsData = await Settings.findOne({
            where: {
                alias: 'pagination_limit'
            }
        })

        if (SettingsData === null) {
            res.render('error', {
                title: "Not found alias `pagination_limit`",
                description: "Please add to the alias `pagination_limit` `settings` section"
            });
            return;
        }

        let page = req.query.page;
        let limit = +SettingsData.value;
        let offset = page > 1 ? ((limit * req.query.page || 1) - limit) : 0;
        const ProxyData = await Proxies.findAll({
            offset: offset,
            limit: limit,
            order: ['fail_request_proxy']
        });
        const ProxiesCount = await Proxies.count();

        res.render('proxy/index', {
            title: 'Proxy list',
            user: req.session.User,
            proxy: ProxyData.map(data => data.toJSON()),
            total_proxies: ProxiesCount,
            total_current_proxies: ProxyData.length,
            limit
        })
    }

    interfaceAdd(req, res) {
        res.render('proxy/add', {
            title: 'Adding a new proxy',
            user: req.session.User
        });
    }

    async interfaceEdit(req, res) {
        const Proxy = await Proxies.findOne({
            where: {
                proxy_id: req.params.proxy_id
            }
        }).catch(error => {
            res.send({
                status: false,
                message: "Proxy ID not found!"
            });
            return;
        });

        res.render('proxy/edit', {
            title: 'Edit proxy ' + Proxy.host_proxy + ":" + Proxy.port_proxy,
            user: req.session.User,
            proxy: Proxy.dataValues
        });

    }


    /*#################################*/
    /*             HANDLES             */
    /*#################################*/
    async handlerIndex(req, res) {
        let status = req.body.status === 'in_active' ? 0 : 1;

        await Proxies.update({
            is_active: status
        }, {
            where: {
                proxy_id: req.body.proxy_id
            }
        }).catch(error => {
            res.send({
                status: false,
            });
            return;
        });

        res.send({
            status: true,
        });
    }

    async handlerAdd(req, res) {
        if (!req.body.protocol_proxy || !req.body.host_proxy || !req.body.port_proxy || !req.body.username_proxy || !req.body.password_proxy) {
            res.send({
                status: false,
                message: 'Please fill in all required fields!'
            })
            return;
        }

        await Proxies.create({
            protocol_proxy: req.body.protocol_proxy,
            host_proxy: req.body.host_proxy,
            port_proxy: req.body.port_proxy,
            username_proxy: req.body.username_proxy,
            password_proxy: req.body.password_proxy
        }).catch(error => {
            res.send({
                status: false,
                message: "Oops. Data not saved!"
            });
            return;
        });

        res.send({
            status: true,
            message: "Data saved!"
        });
    }

    async handlerEdit(req, res) {
        if (!req.body.protocol_proxy || !req.body.host_proxy || !req.body.port_proxy || !req.body.username_proxy || !req.body.password_proxy) {
            res.send({
                status: false,
                message: 'Please fill in all required fields!'
            })
            return;
        }

        await Proxies.update({
            protocol_proxy: req.body.protocol_proxy,
            host_proxy: req.body.host_proxy,
            port_proxy: req.body.port_proxy,
            username_proxy: req.body.username_proxy,
            password_proxy: req.body.password_proxy
        }, {
            where: {
                proxy_id: req.body.proxy_id
            }
        }).catch(error => {
            res.send({
                status: false,
                message: "Proxy ID not found!"
            });
            return;
        });

        res.send({
            status: true,
            message: "Data refreshed!"
        });
    }

}