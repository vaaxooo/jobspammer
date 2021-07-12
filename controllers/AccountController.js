import db from '../config/db.js';

export class AccountController {

    /*#################################*/
    /*             INTERFACE           */
    /*#################################*/
    interfaceIndex(req, res) {
        res.render('account/login', {
            title: 'Login'
        });
    }


    /*#################################*/
    /*             HANDLES             */
    /*#################################*/
    handlerIndex(req, res) {

    }

    handlerAdd(req, res) {

    }

    handlerEdit(req, res) {

    }

}