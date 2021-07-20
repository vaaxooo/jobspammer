import session from 'express-session';

//MODELS
import Admins from '../models/Admins.js';

export function Auth (req, res, next) {

    if(req.session.User === undefined) {
        res.render('account/login', {
            title: "Login"
        })
        return false;
    }

    const Admin = Admins.findOne({
        where: {
            email: req.session.User.email,
            password: req.session.User.password
        }
    })

    if(Admin === null) {
        res.render('account/login', {
            title: "Login"
        })
        return false;
    }


    next();
}