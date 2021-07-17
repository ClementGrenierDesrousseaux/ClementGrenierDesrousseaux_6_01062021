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
    var user_id = req.body.userId;
    var like = req.body.likes;

    if (like == 1) {
        thing.likes++;
        thing.userLiked.push(user_id);
        Thing.updateOne({ _id: req.params.id }, {...thing, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Vous avez like !' }))
            .catch(error => res.status(400).json({ error }));
    }

    if (like == -1) {
        thing.dislikes++;
        thing.userDisliked.push(user_id);
        Thing.updateOne({ _id: req.params.id }, {...thing, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Vous avez dislike !' }))
            .catch(error => res.status(400).json({ error }));
    }

    if (like == 0 && thing.userLiked.indexOf(user_id) < -1) {
        thing.likes--;
        thing.userLiked.splice(user_id, 1);
        Thing.updateOne({ _id: req.params.id }, {...thing, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Vous avez annulé votre like !' }))
            .catch(error => res.status(400).json({ error }));
    } else if (like == 0 && thing.userDisliked.indexOf(user_id) < -1) {
        thing.dislikes--;
        thing.userDisliked.splice(user_id, 1);
        Thing.updateOne({ _id: req.params.id }, {...thing, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Vous avez annulé votre dislike !' }))
            .catch(error => res.status(400).json({ error }));
    }
};