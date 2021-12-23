
const Meetis = require('../../models/Meetis');
const Grupos = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');
const Categorias = require('../../models/Categorias');
const Comentarios = require('../../models/Comentarios');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.mostrarMeeti = async (req, res) => {
    const meeti = await Meetis.findOne({
        where: {
            slug: req.params.slug
        },
        include: [
            {
                model: Grupos
            },
            {
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
    });

    if(!meeti) {
        res.redirect('/');
    }

    //Consultar por meeti's cercanos
    const ubicacion = Sequelize.literal(`ST_GeomFromText( 'POINT( ${meeti.ubicacion.coordinates[0]} ${meeti.ubicacion.coordinates[1]} )')`);

    //ST_DistanceSphere = Retorna un coordenada en metros
    const distancia = Sequelize.fn('ST_DistanceSphere', Sequelize.col('ubicacion'), ubicacion);

    //Encontrar meeti's cercanos
    const cercanos = await Meetis.findAll({
        order: distancia,
        where: Sequelize.where( distancia, { [Op.lte] : 2000 } ),
        limit: 3,
        offset: 1,
        include: [
            {
                model: Grupos
            },
            {
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
    });

    

    const comentarios = await Comentarios.findAll({
        where: {
            meetiId: meeti.id
        },
        include: [
            {
                model: Usuarios,
                attributes: ['id', 'nombre', 'imagen']
            }
        ]
    });

    res.render('mostrar-meeti', {
        nombrePagina: meeti.titulo,
        meeti,
        comentarios,
        cercanos,
        moment
    });
}

exports.confirmarAsistencia = async (req, res) => {
    
    const { accion } = req.body;

    if(accion === 'confirmar') {
        //agregar el usuario
        //array_append es una funcion de postgres para agregar un objeto al final de un arreglo
        await Meetis.update({
            'interesados': Sequelize.fn('array_append', Sequelize.col('interesados'), req.user.id)
        }, {
            'where': {'slug': req.params.slug}
        });
        res.send('Has Confirmado tu asistencia');
    } else {
        //Cancelar la asistencia
        //array_append es una funcion de postgres para remover un objeto al final de un arreglo
        await Meetis.update({
            'interesados': Sequelize.fn('array_remove', Sequelize.col('interesados'), req.user.id)
        }, {
            'where': {'slug': req.params.slug}
        });
        res.send('Has Cancelado tu asistencia');
    }
    

    
}

exports.mostrarAsistentes = async (req, res) => {
    const meeti = await Meetis.findOne({
        where: { slug: req.params.slug },
        attributes: ['interesados']
    });

    const { interesados } = meeti;

    const asistentes = await Usuarios.findAll({
        attributes: ['nombre', 'imagen'],
        where: {
            id: interesados
        }
    });

    res.render('asistentes-meeti', {
        nombrePagina: 'Listado Asistentes Meeti',
        asistentes
    });


}

exports.mostrarCategoria = async (req, res, next) => {
    const categoria = await Categorias.findOne({
        where: {
            slug: req.params.slug
        },
        attributes: ['id', 'nombre']
    });

    const meetis = await Meetis.findAll({
        order: [
            ['fecha', 'ASC']
        ],
        include: [
            {
                model: Grupos,
                where: { categoriaId: categoria.id }
            },
            {
                model: Usuarios
            }
        ]
    });

    res.render('mostrar-categoria', {
        nombrePagina: `Categoria: ${categoria.nombre}`,
        meetis,
        moment
    });

}