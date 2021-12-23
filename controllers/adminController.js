const Grupos = require('../models/Grupos');
const Meetis = require('../models/Meetis');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.panelAdministracion = async (req, res) => {

    const consultas = [];
    consultas.push( Grupos.findAll({ where: { usuarioId: req.user.id } }) );
    consultas.push( Meetis.findAll({ 
        where: { 
            usuarioId: req.user.id,
            fecha: { [Op.gte] : moment(new Date()).format('YYYY-MM-DD')}
        },
        order: [
            [ 'fecha','ASC' ]
        ]
    }));
    consultas.push( Meetis.findAll({ 
        where: { 
            usuarioId: req.user.id,
            fecha: { [Op.lt] : moment(new Date()).format('YYYY-MM-DD')}
        } 
    }));

    const [ grupos, meetis, antes ] = await Promise.all(consultas);
    
    res.render('administracion', {
        nombrePagina: 'Panel de Administracion',
        grupos,
        meetis,
        antes,
        moment
    });
}