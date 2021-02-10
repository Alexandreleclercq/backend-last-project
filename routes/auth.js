const express = require('express');
const { signup, signin, signout, forgotPassword, resetPassword } = require('../controllers/auth');

// importer le validateur de réinitialisation de mot de passe
const { userSignupValidator, userSigninValidator, passwordResetValidator } = require('../validator');
const { userById } = require('../controllers/user');

const router = express.Router();

router.post('/signup', userSignupValidator, signup);
router.post('/signin', userSigninValidator, signin);
router.get('/signout', signout);

// mot de passe oublié et réinitialiser les routes
router.put('/forgot-password', forgotPassword);
router.put('/reset-password', passwordResetValidator, resetPassword);

// toutes les routes contenant :userId , l'application executera d'abord le userByID()
router.param('userId', userById);

module.exports = router;
