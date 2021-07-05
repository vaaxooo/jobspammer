const express = require('express');
const router = express.Router();
var fs = require("fs");
var multer = require('multer');

var connection = require('./db.js');


var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'public/uploads/');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
var upload = multer({storage: storage});

//BEGIN ROUTES
router.get('/', (req, res) => {
    connection.connect();
    connection.query("SELECT * FROM `order`", (error, data) => {
        if (!error) {
            res.render('index', {
                title: 'Task list',
                tasks: data
            })
        }
    });
    connection.end();
});

router.get('/create_task', (req, res) => {
    res.render('create_task', {
        title: 'Create task'
    })
});

//API
router.post('/create_task', upload.single('file'), (req, res) => {
    fs.stat("public/uploads/" + req.file.originalname, function (error, stats) {
        if (error) {
            res.send({
                status: false,
                message: 'File not uploaded!'
            });
        } else {

            res.send({
                status: true,
                message: 'File uploaded!'
            });
        }
    });
});

router.get('/mainsystem/bot/get_file/?file_url=:url(.*)', (req, res) => {
    console.log(req.params.url);
});

//END ROUTES

module.exports = router;