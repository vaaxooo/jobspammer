import dotenv from 'dotenv';
import handlebars from 'express-handlebars';
import express from 'express';
import hbs from 'hbs';
import router from './config/routes.js';
import bodyParser from "body-parser";
import fileUpload from 'express-fileupload';
import Handlebars from 'handlebars';

/*
import Helpers from './config/_helpers.js';*/

const app = express();
dotenv.config();


app.use(fileUpload({
    createParentPath: true,
    useTempFiles: true,
    tempFileDir: './public/temp_files'
}));

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

Handlebars.registerHelper('ifeq', function(a, b, options) {
    if (a == b) return options.fn(this)
    else return options.inverse(this)
});

hbs.reg

app.engine(
    'hbs',
    handlebars({
       layoutsDir: "views/layouts",
       defaultLayout: 'app',
       extname: "hbs"
    })
)

hbs.registerPartials("./views/partials");
app.set('views', './views')
app.set('view engine', 'hbs')
app.use(express.static('./public'));

app.use(router);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running at http://127.0.0.1:${process.env.PORT}/`));