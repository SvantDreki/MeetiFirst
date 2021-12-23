const express = require('express');
const router = require('./routes');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');

//Configuracion y Modelos DB
const db = require('./config/db');
require('./models/Usuarios'); 
require('./models/Categorias');
require('./models/Grupos'); 
require('./models/Meetis');
require('./models/Comentarios');
db.sync()
    .then(() => console.log('DB conectada'))
    .catch(error => console.log(error));

//Variables de desarrollo
require('dotenv').config( {path: 'variables.env'} );

//Aplicacion Principal
const app = express();

//Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Habilitar EJS como template engine
app.use(expressLayouts);
app.set('view engine', 'ejs');

//Ubicacion de las vistas
app.set('views', path.join(__dirname, './views'));

//Archivos estaticos
app.use(express.static('public'));

//Habilitar cookie parser
app.use(cookieParser());

//Crear la sesion
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false
}));

//Inicializar passport
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//Middleware (usuario logueado, flash message, fecha actual)
app.use((req, res, next) => {
    res.locals.usuario = {...req.user} || null;
    res.locals.mensajes = req.flash();
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();
    next();
});

//Routing
app.use('/', router());

//Agrega puerto
app.listen(process.env.PORT, () => {
    console.log('El servidor esta funcionando');
});