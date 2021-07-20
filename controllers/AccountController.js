import sequelize from '../config/db.js';
import md5 from 'md5';
import session from 'express-session';

//MODELS
import Admins from '../models/Admins.js';

export class AccountController {

    /*#################################*/
    /*             INTERFACE           */

    /*#################################*/
    interfaceIndex(req, res) {
        res.render('account/login', {
            title: 'Login'
        });
    }

    interfaceLogout(req, res) {
        req.session.User = undefined;
        res.render('account/login', {
            title: 'Login'
        });
    }

    interfaceEdit(req, res) {
        res.render('account/edit', {
            title: 'Edit profile',
            user: req.session.User
        });
    }

    /*#################################*/
    /*             HANDLES             */

    /*#################################*/
    async handlerIndex(req, res) {
        if (!req.body.email || !req.body.password) {
            res.json({
                status: false,
                message: "Please fill in all required fields!"
            });
            return false;
        }
        const Admin = await Admins.findOne({
            where: {
                email: req.body.email
            }
        });
        if (!Admin || md5(md5(req.body.password)) !== Admin.password) {
            res.json({
                status: false,
                message: "E-mail or password is incorrect!"
            });
            return false;
        }
        req.session.User = Admin;
        res.json({
            status: true,
            message: "You are successfully logged in!"
        });
    }


    async handlerEdit(req, res) {
        if (!req.body.firstname || !req.body.lastname || !req.body.email) {
            res.json({
                status: false,
                message: "Please fill in all required fields!"
            });
            return false;
        }
        const AdminsResponse = await Admins.update({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
        }, {
            where: {
                email: req.session.User.email
            }
        });
        req.session.User.email = req.body.email;
        req.session.User.firstname = req.body.firstname;
        req.session.User.lastname = req.body.lastname;
        res.json({
            status: true,
            message: "Profile data changed successfully!"
        })
    }


    async handlerChangePassword(req, res) {
        if (!req.body.new_password || !req.body.repeat_password || !req.body.current_password) {
            res.json({
                status: false,
                message: "Please fill in all required fields!"
            });
            return false;
        }
        const Admin = await Admins.findOne({
            where: {
                email: req.session.User.email
            }
        });
        if (!Admin) {
            res.json({
                status: false,
                message: "Oops.. Something went wrong!"
            });
            return false;
        }
        if (req.body.new_password !== req.body.repeat_password) {
            res.json({
                status: false,
                message: "New password does not match!"
            });
            return false;
        }
        if (Admin.password !== md5(md5(req.body.current_password))) {
            res.json({
                status: false,
                message: "Current password is incorrect!"
            })
            return false
        }
        await Admin.update({
            password: md5(md5(req.body.new_password))
        }, {
            where: {
                email: req.session.User.email
            }
        })
        res.json({
            status: true,
            message: "Password changed successfully!"
        })
    }

}