import db from '../config/db.js';

import sequelize from '../config/db.js';
import Settings from '../models/Settings.js';
import Portals from '../models/Portals.js';

export class PortalsController {

    /*#################################*/
    /*             INTERFACE           */
    /*#################################*/

    /**
     * PAGE [/portals/index]
     * @param req
     * @param res
     */
    async interfaceIndex(req, res) {
        const SettingsData = await Settings.findOne({
            where: {
                alias: 'pagination_limit'
            }
        });
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
        const PortalsData = await Portals.findAll({
            offset: offset,
            limit: limit
        });
        const PortalsCount = await Portals.count();
        res.render('portal/index', {
            title: 'Portal',
            user: req.session.User,
            portal: PortalsData.map(data => data.toJSON()),
            total_portals: PortalsCount,
            total_current_portals: PortalsData.length,
            limit
        });
    }

    /**
     * PAGE [/portals/add]
     * @param req
     * @param res
     */
    interfaceAdd(req, res) {
        res.render('portal/add', {
            title: 'Add new portal',
            user: req.session.User,
        });
    }

    /**
     * PAGE [/portals/edit/:portal_id]
     * @param req
     * @param res
     */
    async interfaceEdit(req, res) {
        const PortalData = await Portals.findOne({
            where: {
                id: req.params.portal_id
            },
        });
        if (PortalData === null) {
            res.json({
                status: false,
                message: "Portal ID not found!"
            });
            return;
        }
        res.render('portal/edit', {
            title: 'Edit portal ' + PortalData.alias,
            user: req.session.User,
            portal: PortalData.dataValues
        });
    }

    /**
     * PAGE [/portals/statistic]
     * @param req
     * @param res
     */
    async interfaceStatistic(req, res) {
        let PortalsData = await sequelize.query('SELECT p.name, p.id as "portal_id", o.all_links, o.send_links, o.fail_links, o.id as "order_id" FROM `portal` as p JOIN `order` as o ON p.id = o.portal')

            let portals = new Map();

            PortalsData[0].map(function (value) {
                if(portals.get(value.portal_id) === undefined) {
                    portals.set(value.portal_id, {
                        name: value.name,
                        total_tasks: 1,
                        all_links: value.all_links,
                        send_links: value.send_links,
                        fail_links: value.fail_links
                    });
                } else {
                    portals.set(value.portal_id, {
                        name: value.name,
                        total_tasks: +portals.get(value.portal_id).total_tasks + 1,
                        all_links: +portals.get(value.portal_id).all_links + value.all_links,
                        send_links: +portals.get(value.portal_id).send_links + value.send_links,
                        fail_links: +portals.get(value.portal_id).fail_links + value.fail_links
                    })
                }

            });

            res.render('portal/statistic', {
                title: 'Portals statistic',
                user: req.session.User,
                portals: Object.fromEntries(portals),
            });
    }


    /*#################################*/
    /*             HANDLES             */
    /*#################################*/

    /**
     * HANDLER PAGE [/portals/index]
     * @param req
     * @param res
     */
    async handlerIndex(req, res) {
        let status = req.body.status === 'in_active' ? 0 : 1;
        await Portals.update({
            is_active: status
        }, {
            where: {
                id: req.body.portal_id
            }
        });
        res.json({
            status: true,
        });
        return;
    }

    /**
     * HANDLER PAGE [/portals/add]
     * @param req
     * @param res
     * @returns {boolean}
     */
    async handlerAdd(req, res) {
        if (!req.body.alias || !req.body.name) {
            res.json({
                status: false,
                message: "Please fill in all required fields!"
            });
            return false;
        }

        await Portals.create({
            alias: req.body.alias,
            name: req.body.name,
            is_active: 1
        }).catch(error => {
            res.json({
                status: false,
                message: "Oops. Data not saved!"
            });
            return;
        });

        res.json({
            status: true,
            message: "Data saved!"
        });

    }

    /**
     * HANDLER PAGE [/portals/edit]
     * @param req
     * @param res
     * @returns {boolean}
     */
    async handlerEdit(req, res) {
        if (!req.body.name) {
            res.json({
                status: false,
                message: "Please fill in all required fields!"
            });
            return false;
        }

        await Portals.update({
            name: req.body.name
        }, {
            where: {
                id: req.body.portal_id
            }
        }).catch(error => {
            res.json({
                status: false,
                message: "Portal ID not found!"
            });
            return;
        });

        res.json({
            status: true,
            message: "Data refreshed!"
        })
    }

}