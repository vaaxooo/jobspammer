require('dotenv').config()
const handlebars = require('express-handlebars');
const hbs = require('hbs');
const express = require('express');
const app = express();

app.use(require('./config/routes.js'));

app.engine(
    'hbs',
    handlebars({
       layoutsDir: "views/layouts",
       defaultLayout: 'app',
       extname: "hbs"
    })
)

hbs.registerPartials(__dirname + "/views/partials");
app.set('views', './views')
app.set('view engine', 'hbs')
app.use(express.static(__dirname + '/public'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running at http://127.0.0.1:${process.env.PORT}/`));