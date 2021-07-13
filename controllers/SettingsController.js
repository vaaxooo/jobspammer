import db from '../config/db.js';

export class SettingsController {

    interfaceIndex(req, res) {
        db.query("SELECT * FROM `settings`",
            (error, data) => {
                if (!error) {
                    res.render('settings/index', {
                        title: 'Settings',
                        user: req.session.User,
                        settings: data
                    });
                }
            });
    }

    interfaceAdd(req, res) {
        res.render('settings/add', {
            title: 'Add new alias',
            user: req.session.User
        });
    }

    interfaceEdit(req, res) {
        db.query("SELECT * FROM `settings` WHERE `id` = ? LIMIT ?", [req.params.settings_id, 1], function (error, data) {
            if (error || Object.keys(data).length === 0) {
                res.send({
                    status: false,
                    message: "Alias ID not found!"
                });
                return;
            }

            res.render('settings/edit', {
                title: 'Edit alias ' + data[0].alias,
                user: req.session.User,
                settings: data[0]
            });
        });
    }

    handlerEdit(req, res) {
        if(!req.body.alias || !req.body.description) {
            res.json({
                status: false,
                message: "Please fill in all required fields!"
            });
            return false;
        }

        db.query("UPDATE `settings` SET `alias` = ?, `description` = ? WHERE `id` = ?",
            [req.body.alias, req.body.description, req.body.settings_id],
            function (error, data) {
                if (error || Object.keys(data).length === 0) {
                    res.send({
                        status: false,
                        message: "Settings ID not found!"
                    });
                    return;
                }

                res.send({
                    status: true,
                    message: "Data refreshed!"
                })
            });
    }

    handlerAdd(req, res) {
        if(!req.body.alias || !req.body.description) {
            res.json({
                status: false,
                message: "Please fill in all required fields!"
            });
            return false;
        }

        db.query("INSERT INTO `settings` (`alias`, `is_active`, `description`) VALUES " +
            "(?, ?, ?)", [req.body.alias, 1, req.body.description],
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

    handlerIndex(req, res) {
        let status = req.body.status === 'in_active' ? 0 : 1;
        db.query("UPDATE `settings` SET `is_active` = ? WHERE `id` = ?", [status, req.body.settings_id],
            (error, data) => {
                if (!error) {
                    res.send({
                        status: true,
                    });
                    return;
                }
            });
    }


}