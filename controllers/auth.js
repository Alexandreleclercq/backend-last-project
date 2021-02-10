const jwt = require('jsonwebtoken');
require('dotenv').config();
const expressJwt = require('express-jwt');
const User = require('../models/user');
const _ = require('lodash');
const { sendEmail } = require('../helpers');

exports.signup = async (req, res) => {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists)
        return res.status(403).json({
            error: 'Cet e-mail est déjà pris!'
        });
    const user = new User(req.body);
    await user.save();
    res.status(200).json({ message: 'Compte créé. Vous pouvez vous connecter.' });
};

exports.signin = (req, res) => {
    // trouver l'utilisateur avec son email
    const { email, password } = req.body;
    User.findOne({ email }, (err, user) => {
        // si err ou pas d'utilisateur
        if (err || !user) {
            return res.status(401).json({
                error: 'E-mail non trouvé. Veuillez créer un compte.'
            });
        }
        // si l'utilisateur est trouvé, s'assuré que l'adresse e-mail et le mot de passe correspondent
        // créer une méthode d'authentification dans le modèle et l'utiliser ici
        if (!user.authenticate(password)) {
            return res.status(401).json({
                error: 'L\'email et le mot de passe ne correspondent pas'
            });
        }
        // générer un jeton avec identifiant utilisateur et secret
        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET);
        // conserver le jeton comme «t» dans le cookie avec la date d'expiration
        res.cookie('t', token, { expire: new Date() + 600000 });
        // retourne la réponse avec l'utilisateur et le jeton au client front
        const { _id, name, email, role } = user;
        return res.json({ token, user: { _id, email, name, role } });
    });
};

exports.signout = (req, res) => {
    res.clearCookie('t');
    return res.json({ message: 'Déconnexion réussie !' });
};

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    userProperty: 'auth'
});

exports.forgotPassword = (req, res) => {
    if (!req.body) return res.status(400).json({ message: 'Pas de req.body' });
    if (!req.body.email) return res.status(400).json({ message: 'Pas d\'email dans le req.body' });

    const { email } = req.body;
    // trouver l'utilisateur par e-mail
    User.findOne({ email }, (err, user) => {
        // if err or no user
        if (err || !user)
            return res.status('401').json({
                error: 'Aucun utilisateur avec cet e-mail'
            });

        // générer un jeton avec identifiant utilisateur et secret
        const token = jwt.sign({ _id: user._id, iss: process.env.APP_NAME }, process.env.JWT_SECRET);

        // données email
        const emailData = {
            from: process.env.COMPTE_GMAIL,
            to: email,
            subject: 'Instructions de régénération du mot de passe',
            text: `Veuillez cliquer sur le lien suivant pour réinitialiser votre mot de passe : ${process.env.CLIENT_URL
                }/reset-password/${token}`,
            html: `<p>Veuillez cliquer sur le lien suivant pour réinitialiser votre mot de passe :</p> <p>${process.env.CLIENT_URL
                }/reset-password/${token}</p>`
        };

        return user.updateOne({ resetPasswordLink: token }, (err, success) => {
            if (err) {
                return res.json({ message: err });
            } else {
                sendEmail(emailData);
                return res.status(200).json({
                    message: `E-mail envoyé à ${email}. Merci de suivre les instructions pour régénérer votre mot de passe.`
                });
            }
        });
    });
};

// pour permettre à l'utilisateur de réinitialiser le mot de passe
// vous trouverez d'abord l'utilisateur dans la base de données avec resetPasswordLink
// La valeur resetPasswordLink du modèle utilisateur doit correspondre au jeton

exports.resetPassword = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body;

    User.findOne({ resetPasswordLink }, (err, user) => {
        // if err or no user
        if (err || !user)
            return res.status('401').json({
                error: 'Lien invalide'
            });

        const updatedFields = {
            password: newPassword,
            resetPasswordLink: ''
        };

        user = _.extend(user, updatedFields);
        user.updated = Date.now();

        user.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            res.json({
                message: `Votre mot de passe a été modifié. Vous pouvez à présent vous connecter.`
            });
        });
    });
};
