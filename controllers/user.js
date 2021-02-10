const _ = require('lodash');
const User = require('../models/user');
const formidable = require('formidable');
const fs = require('fs');

exports.userById = (req, res, next, id) => {
    User.findById(id)
        // populate followers and following users array
        .populate('following', '_id name')
        .populate('followers', '_id name')
        .exec((err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    error: 'Utilisateur introuvable'
                });
            }
            req.profile = user; // ajoute un objet de profile dans la demande avec des informations sur l'utilisateur
            next();
        });
};

exports.hasAuthorization = (req, res, next) => {
    let sameUser = req.profile && req.auth && req.profile._id == req.auth._id;
    let adminUser = req.profile && req.auth && req.auth.role === 'admin';

    const authorized = sameUser || adminUser;

    // console.log("req.profile ", req.profile, " req.auth ", req.auth);
    // console.log("SAMEUSER", sameUser, "ADMINUSER", adminUser);

    if (!authorized) {
        return res.status(403).json({
            error: 'L\'utilisateur n\'a pas les droits pour effectuer cette action'
        });
    }
    next();
};

exports.allUsers = (req, res) => {
    User.find((err, users) => {
        if (err) {
            return res.status(400).json({
                error: err
            });
        }
        res.json(users);
    }).select('name email updated created role');
};

exports.getUser = (req, res) => {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile);
};

exports.updateUser = (req, res, next) => {
    let form = new formidable.IncomingForm();
    // console.log("données de formulaire entrantes: ", form);
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'L\'image n\'a pas pu être téléchargée'
            });
        }
        // save user
        let user = req.profile;
        // console.log("utilisateur mis à jour: ", user);
        user = _.extend(user, fields);

        user.updated = Date.now();
        // console.log("MISE À JOUR DES DONNÉES DU FORMULAIRE UTILISATEUR: ", user);

        if (files.photo) {
            user.photo.data = fs.readFileSync(files.photo.path);
            user.photo.contentType = files.photo.type;
        }

        user.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            user.hashed_password = undefined;
            user.salt = undefined;
            // console.log("utilisateur après mise à jour avec formdata: ", user);
            res.json(user);
        });
    });
};

exports.userPhoto = (req, res, next) => {
    if (req.profile.photo.data) {
        res.set(('Content-Type', req.profile.photo.contentType));
        return res.send(req.profile.photo.data);
    }
    next();
};

exports.deleteUser = (req, res, next) => {
    let user = req.profile;
    user.remove((err, user) => {
        if (err) {
            return res.status(400).json({
                error: err
            });
        }
        res.json({ message: 'Utilisateur supprimé' });
    });
};
