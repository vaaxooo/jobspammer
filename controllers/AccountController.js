import db from '../config/db.js';
import md5 from 'md5';
import session from 'express-session';

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
    handlerIndex(req, res) {
        if (!req.body.email || !req.body.password) {
            res.json({
                status: false,
                message: "Please fill in all required fields!"
            });
            return false;
        }

        db.query("SELECT * FROM `admins` WHERE `email` = ? LIMIT 1", [req.body.email], function (error, data) {
            if (error) {
                res.json({
                    status: false,
                    message: "Oops.. Something went wrong!"
                });
                return false;
            }

            let user = data[0];
            if (!user || md5(md5(req.body.password)) !== user.password) {
                res.json({
                    status: false,
                    message: "E-mail or password is incorrect!"
                });
                return false;
            }

            req.session.User = user;
            res.json({
                status: true,
                message: "You are successfully logged in!"
            })


        });
    }

    handlerEdit(req, res) {
        db.query("UPDATE `admins` SET `firstname` = ?, `lastname` = ?, `email` = ? WHERE `email` = ?",
            [req.body.firstname, req.body.lastname, req.body.email, req.session.User.email], function (error, data) {
                if (error) {
                    res.json({
                        status: false,
                        message: "Oops.. Something went wrong!"
                    });
                    return false;
                }

                req.session.User.email = req.body.email;
                req.session.User.firstname = req.body.firstname;
                req.session.User.lastname = req.body.lastname;
                res.json({
                    status: true,
                    message: "Profile data changed successfully!"
                })

            });
    }

    handlerChangePassword(req, res) {

        if(!req.body.new_password || !req.body.repeat_password || !req.body.current_password) {
            res.json({
                status: false,
                message: "Please fill in all required fields!"
            });
            return false;
        }

        db.query("SELECT * FROM `admins` WHERE `email` = ? LIMIT 1", [req.session.User.email], function (error, data) {
            if (error || !data[0]) {
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

            let user = data[0];
            if (user.password !== md5(md5(req.body.current_password))) {
                res.json({
                    status: false,
                    message: "Current password is incorrect!"
                })
                return false
            }

            db.query("UPDATE `admins` SET `password` = ? WHERE `email` = ?",
                [md5(md5(req.body.new_password)), req.session.User.email]);
            res.json({
                status: true,
                message: "Password changed successfully!"
            })

        });
    }

}