const Thing = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const thingObject = JSON.parse(req.body.sauce);
    delete thingObject_id;
    thingObject.likes = 0;
    thingObject.dislikes = 0;
    thingObject.userLiked = [];
    thingObject.userDisliked = [];
    const thing = new Thing({
        ...thingObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    thing.save()
        .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
        .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Thing.findOne({ _id: req.params.id })
        .then(thing => res.status(200).json(thing))
        .catch(error => res.status(404).json({ error }));
};

exports.modifySauce = (req, res, next) => {
    const thingObject = req.file ? {
        ...JSON.parse(req.body.thing),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body };

    Thing.updateOne({ _id: req.params.id }, {...thingObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié !' }))
        .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    Thing.findOne({ _id: req.params.id })
        .then(thing => {
            const filename = thing.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Thing.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
    Thing.find()
        .then(thing => res.status(200).json(thing))
        .catch(error => res.status(400).json({ error }));
};

exports.likeSauces = (req, res, next) => {
    //Si l'utilisateur like une sauce
    if (req.body.like === 1) {
        Thing.updateOne({ _id: req.params.id }, { $push: { usersLiked: req.body.userId }, $inc: { likes: +1 } })
            .then(() => res.status(200).json({ message: 'Like ajouté' }))
            .catch((error) => res.status(400).json({ error }))
    }
    //Si l'utilisateur dislike une sauce
    if (req.body.like === -1) {
        Thing.updateOne({ _id: req.params.id }, { $push: { usersDisliked: req.body.userId }, $inc: { dislikes: +1 } })
            .then(() => { res.status(200).json({ message: 'Dislike ajouté !' }) })
            .catch((error) => res.status(400).json({ error }))
    }
    //Si l'utilisateur annule son like ou son dislike
    if (req.body.like === 0) {
        Thing.findOne({ _id: req.params.id })
            .then((sauce) => {
                if (sauce.usersLiked.includes(req.body.userId)) {
                    Thing.updateOne({ _id: req.params.id }, { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 }, })
                        .then(() => res.status(200).json({ message: 'Like retiré !' }))
                        .catch((error) => res.status(400).json({ error }))
                }
                if (sauce.usersDisliked.includes(req.body.userId)) {
                    Thing.updateOne({ _id: req.params.id }, { $pull: { usersDisliked: req.body.userId }, $inc: { dislikes: -1 }, })
                        .then(() => res.status(200).json({ message: 'Dislike retiré !' }))
                        .catch((error) => res.status(400).json({ error }))
                }
            })
            .catch((error) => res.status(404).json({ error }))
    }
};