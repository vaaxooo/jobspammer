import session from 'express-session';
import db from '../config/db.js';

export function Auth (req, res, next) {

    if(req.session.User === undefined) {
        res.render('account/login', {
            title: "Login"
        })
        return false;
    }


    db.query("SELECT * FROM `admins` WHERE `email` = ? AND `password` = ? LIMIT 1",
        [req.session.User.email, req.session.User.password], function (error, data) {
        if(error || !data[0]) {
            res.render('account/login', {
                title: "Login"
            })
            return false;
        }
    })

    next();
}