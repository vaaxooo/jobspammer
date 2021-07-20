import db from '../config/db.js';

import Settings from '../models/Settings.js';

export class SettingsController {

    async interfaceIndex(req, res) {
        const SettingsData = await Settings.findAll();
        res.render('settings/index', {
            title: 'Settings',
            user: req.session.User,
            settings: SettingsData.map(data => data.toJSON())
        });
    }

    interfaceAdd(req, res) {
        res.render('settings/add', {
            title: 'Add new alias',
            user: req.session.User
        });
    }

    async interfaceEdit(req, res) {
        const SettingsData = await Settings.findOne({
            where: {
                id: req.params.settings_id
            }
        });

        if (SettingsData === null) {
            res.send({
                status: false,
                message: "Alias ID not found!"
            });
            return;
        }

        res.render('settings/edit', {
            title: 'Edit alias ' + SettingsData.alias,
            user: req.session.User,
            settings: SettingsData.dataValues
        });

    }

    async handlerEdit(req, res) {
        if(!req.body.alias || !req.body.description) {
            res.json({
                status: false,
                message: "Please fill in all required fields!"
            });
            return false;
        }

        const SettingsData = await Settings.update({
            alias: req.body.alias,
            value: req.body.value,
            description: req.body.description
        },{
            where: {
                id: req.body.settings_id
            }
        });

        if (SettingsData === null) {
            res.send({
                status: false,
                message: "Settings ID not found!"
            });
            return;
        }

        res.send({
            status: true,
            message: "Data refreshed!"
        });

    }

    async handlerAdd(req, res) {
        if(!req.body.alias || !req.body.description) {
            res.json({
                status: false,
                message: "Please fill in all required fields!"
            });
            return false;
        }

        const Response = await Settings.create({
            alias: req.body.alias,
            value: req.body.value,
            is_active: 1,
            description: req.body.description
        }).catch(error => {
            console.error(error)
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

    async handlerIndex(req, res) {
        let status = req.body.status === 'in_active' ? 0 : 1;

        await Settings.update({
            is_active: status
        }, {
            where: {
                id: req.body.settings_id
            }
        })

        res.send({
            status: true,
        });
        return;
    }


}