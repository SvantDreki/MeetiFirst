const Meetis = require('../../models/Meetis');
const Grupos = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');

exports.resultadosBusqueda = async (req, res) => {
    
    //req.query lee los datos de un from con method GET
    const { categoria, titulo, ciudad, pais } = req.query;

    let query;
    if(categoria === ''){
        query = '';
    } else {
        query = {
            categoriaId : { [Op.eq] :  categoria  }
        }
    }

    //Filtra los meetis por los terminos de busqueda
    const meetis = await Meetis.findAll({ 
        where :  { 
            titulo : { [Op.iLike] :  '%' + titulo + '%'},
            ciudad : { [Op.iLike] :  '%' + ciudad + '%' },
            pais : { [Op.iLike] :  '%' + pais + '%' }
        },
        include: [
            {
                model: Grupos, 
                where: query
            },
            {
                model: Usuarios, 
                attributes : ['id',  'nombre', 'imagen']
            }
        ]
    });

    

    res.render('busqueda', {
        nombrePagina: 'Resultados Búsqueda',
        meetis,
        moment
    });

}