const Grupos = require('../models/Grupos');
const Meeti = require('../models/Meetis');
const { sanitizeBody } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

exports.formNuevoMeeti = async (req, res) => {

    const grupos = await Grupos.findAll({
        where: {
            usuarioId: req.user.id
        }
    });
    res.render('nuevo-meeti', {
        nombrePagina: 'Crear Nuevo Meeti',
        grupos
    });
}

exports.crearMeeti = async (req, res) =>{
    
    //Obtener los datos
    const meeti = req.body;

    console.log(req.body);

    //Asignar el usuario
    meeti.usuarioId = req.user.id;
    meeti.id = uuidv4();

    //Almacena la ubicacion con un point
    const point = { type: 'Point', coordinates: [ parseFloat(req.body.lat), parseFloat(req.body.lng) ] };
    meeti.ubicacion = point;

    try {
        await Meeti.create(meeti);
        req.flash('exito', 'Se ha creado el Meeti Correctamente');
        res.redirect('/administracion');
    } catch (error) {
        
        //Errores de sequelize
        const sequelizeErrors = error.errors.map(err => err.message);

        req.flash('error', sequelizeErrors);
        res.redirect('/nuevo-meeti');
    }



}

exports.sanitizarMeeti = (req, res, next) => {
    
    sanitizeBody('titulo');
    sanitizeBody('invitado');
    sanitizeBody('cupo');
    sanitizeBody('fecha');
    sanitizeBody('hora');
    sanitizeBody('direccion');
    sanitizeBody('ciudad');
    sanitizeBody('region');
    sanitizeBody('pais');
    sanitizeBody('lat');
    sanitizeBody('lng');
    sanitizeBody('grupoId');

    next();
}

exports.formEditarMeeti = async (req, res) => {
    
    const consultas = [];
    consultas.push( Grupos.findAll( { 
        where: {
            usuarioId: req.user.id
        }
    } ));
    consultas.push( Meeti.findByPk(req.params.id));

    const [ grupos, meetis ] = await Promise.all(consultas);

    if(!grupos || !meetis) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    res.render('editar-meeti', {
        nombrePagina: `Editar Meeti: ${meetis.titulo}`,
        grupos,
        meetis
    });

}

exports.editarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({
        where: {
            id: req.params.id,
            usuarioId: req.user.id
        }
    });

    if(!meeti) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    const { grupoId, titulo, invitado, fecha, hora, cupo, descripcion, direccion, ciudad, region, pais, lat, lng} = req.body;

    meeti.grupoId = grupoId;
    meeti.titulo = titulo;
    meeti.invitado = invitado;
    meeti.fecha = fecha;
    meeti.hora = hora;
    meeti.cupo = cupo;
    meeti.descripcion = descripcion;
    meeti.direccion = direccion;
    meeti.ciudad = ciudad;
    meeti.region = region;
    meeti.pais = pais;

    //Asignar point (ubicacion)
    const point = { type: 'Point', coordinates: [ parseFloat(lat), parseFloat(lng) ] };

    meeti.ubicacion = point;

    await meeti.save();
    req.flash('exito', 'Cambios Guardados Correctamente');
    res.redirect('/administracion');
}

exports.formEliminarMeeti = async (req, res ,next) => {
    const meeti = await Meeti.findOne({
        where: {
            id: req.params.id,
            usuarioId: req.user.id
        }
    });

    if(!meeti) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    res.render('eliminar-meeti', {
        nombrePagina: `Elimiar Meeti: ${meeti.titulo}`
    });
}

exports.eliminarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({
        where: {
            id: req.params.id,
            usuarioId: req.user.id
        }
    });

    if(!meeti) {
        req.flash('error', 'Operación No Válida');
        res.redirect('/administracion');
        next();
    }

    await Meeti.destroy({
        where: {
            id: req.params.id
        }
    });
    req.flash('exito', 'Meeti Elimiando Correctamente');
    res.redirect('/administracion');
}