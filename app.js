require('dotenv').config()
const handlebars = require('express-handlebars');
const express = require('express');
const app = express();
const hbs = require('hbs');

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

app.use(require('./config/routes.js'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running at http://127.0.0.1:${process.env.PORT}/`));


hbs.registerHelper({
    eq: (v1, v2) => v1 === v2,
    ne: (v1, v2) => v1 !== v2,
    lt: (v1, v2) => v1 < v2,
    gt: (v1, v2) => v1 > v2,
    lte: (v1, v2) => v1 <= v2,
    gte: (v1, v2) => v1 >= v2,
    and() {
        return Array.prototype.every.call(arguments, Boolean);
    },
    or() {
        return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
    }
});