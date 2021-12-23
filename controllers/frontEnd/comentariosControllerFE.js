const Comentarios = require('../../models/Comentarios');
const Meetis = require('../../models/Meetis');

exports.agregarComentario = async (req, res, next) => {
    
    const { comentario } = req.body;

    await Comentarios.create({
        mensaje: comentario,
        usuarioId: req.user.id,
        meetiId: req.params.id
    });

    res.redirect('back');
    next();
}

exports.eliminarComentario = async (req, res, next) => {
    
    //Tomar el id del comentario
    const { comentarioId } = req.body;

    //Consultar el comentario
    const comentario = await Comentarios.findOne({
        where: { id: comentarioId }
    });

    //Verificar que el comentario existe
    if(!comentario) {
        res.status(404).send('Acción no Válida');
        return next();
    }

    const meeti = await Meetis.findOne({
        where: {
            id: comentario.meetiId
        }
    });

    //Verificar que quien lo borra sea el creador
    if(comentario.usuarioId === req.user.id || meeti.usuarioId === req.user.id) {
        await Comentarios.destroy({
            where: {
                id: comentario.id
            }
        });
        res.status(200).send('Eliminado Correctamente');
        return next();
    } else {
        res.status(403).send('Acción no Válida');
        return next();
    }
}