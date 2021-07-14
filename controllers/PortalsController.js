import db from '../config/db.js';

export class PortalsController {

    /*#################################*/
    /*             INTERFACE           */
    /*#################################*/
    interfaceIndex(req, res) {
        db.query("SELECT * FROM `settings` WHERE `alias` = ? LIMIT ?", ['pagination_limit', 1], function (error_settings, settings) {
            if (error_settings || !settings) {
                res.render('error', {
                    title: "Not found alias `pagination_limit`",
                    description: "Please add to the alias `pagination_limit` `settings` section"
                });
                return;
            }
            let page = req.query.page;
            let limit = +settings[0].value;
            let offset = page > 1 ? ((limit * req.query.page || 1) - limit) : 0;
            db.query("SELECT * FROM `portal` ORDER BY `id` LIMIT ?, ?",
                [offset, limit],
                (error, data) => {
                    db.query("SELECT COUNT(*) as 'count' FROM `portal`", function (error, cportal) {
                        if (!error) {
                            res.render('portal/index', {
                                title: 'Portal',
                                user: req.session.User,
                                portal: data,
                                total_portals: cportal[0].count,
                                total_current_portals: data.length,
                                limit
                            });
                        }
                    });
                });
        });
    }

    interfaceAdd(req, res) {
        res.render('portal/add', {
            title: 'Add new portal',
            user: req.session.User,
        });
    }

    interfaceEdit(req, res) {
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
                user: req.session.User,
                portal: data[0]
            });
        });
    }

    interfaceStatistic(req, res) {
        db.query('SELECT p.name, p.id as "portal_id", o.all_links, o.send_links, o.fail_links, o.id as "order_id" FROM `portal` as p JOIN `order` as o ON p.id = o.portal',
            function (error, data){
                let portals = new Map();


                data.map(function (value) {

                    if(portals.get(value.portal_id) === undefined) {
                        portals.set(value.portal_id, {
                            name: value.name,
                            total_tasks: 0,
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

            });

    }


    /*#################################*/
    /*             HANDLES             */

    /*#################################*/
    handlerIndex(req, res) {
        let status = req.body.status === 'in_active' ? 0 : 1;
        db.query("UPDATE `portal` SET `is_active` = ? WHERE `id` = ?", [status, req.body.portal_id],
            (error, data) => {
                if (!error) {
                    res.json({
                        status: true,
                    });
                    return;
                }
            });
    }

    handlerAdd(req, res) {
        if (!req.body.alias || !req.body.name) {
            res.json({
                status: false,
                message: "Please fill in all required fields!"
            });
            return false;
        }

        db.query("INSERT INTO `portal` (`alias`, `name`, `is_active`) VALUES " +
            "(?, ?, ?)", [req.body.alias, req.body.name, 1],
            function (error, data) {
                if (error) {
                    res.json({
                        status: false,
                        message: "Oops. Data not saved!"
                    });
                    return;
                }

                res.json({
                    status: true,
                    message: "Data saved!"
                });
            });
    }

    handlerEdit(req, res) {
        if (!req.body.name) {
            res.json({
                status: false,
                message: "Please fill in all required fields!"
            });
            return false;
        }

        db.query("UPDATE `portal` SET `name` = ? WHERE `id` = ?",
            [req.body.name, req.body.portal_id],
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
    }

}