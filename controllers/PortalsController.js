import db from '../config/db.js';

export class PortalsController {

    /*#################################*/
    /*             INTERFACE           */
    /*#################################*/
    interfaceIndex(req, res) {
        let page = req.query.page;
        let limit = 5;
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
                            total_current_portals: data.length
                        });
                    }
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