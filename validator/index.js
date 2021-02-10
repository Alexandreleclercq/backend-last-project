exports.createPostValidator = (req, res, next) => {
    // title
    req.check('title', 'Titre requis').notEmpty();
    req.check('title', 'Le titre doit faire entre 4 et 150 caractères').isLength({
        min: 4,
        max: 150
    });
    // body
    req.check('body', 'Corps du message requis').notEmpty();
    req.check('body', 'Le corps du message doit faire entre 4 et 2000 caractères').isLength({
        min: 4,
        max: 2000
    });
    // vérifier les erreurs
    const errors = req.validationErrors();

    if (errors) {
        const firstError = errors.map(error => error.msg)[0];
        return res.status(400).json({ error: firstError });
    }

    next();
};

exports.userSignupValidator = (req, res, next) => {
    // le nom n'est pas nul et comprend entre 4 et 10 caractères
    req.check('name', 'Nom requis').notEmpty();
    // l'email n'est pas nul, valide et normalisé
    req.check('email', 'L\'e-mail doit faire entre 3 et 32 caractères')
        .matches(/.+\@.+\..+/)
        .withMessage('L\'e-mail doit contenir le signe @')
        .isLength({
            min: 4,
            max: 2000
        });
    // vérifier le mot de passe
    req.check('password', 'Mot de passe requis').notEmpty();
    req.check('password')
        .isLength({ min: 6 })
        .withMessage('Le mot de passe doit faire au moins 6 caractères')
        .matches(/\d/)
        .withMessage('Le mot de passe doit contenir au moins un chiffre');
    // vérifier les erreurs
    const errors = req.validationErrors();

    if (errors) {
        const firstError = errors.map(error => error.msg)[0];
        return res.status(400).json({ error: firstError });
    }

    next();
};

exports.userSigninValidator = (request, response, next) => {
    request
        .check('email', 'L\'e-mail doit faire entre 3 et 32 caractères')
        .matches(
            /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/
        )
        .withMessage('Merci de saisir une adresse e-mail valide')
        .isLength({
            min: 4,
            max: 32
        });
    request
        .check('password')
        .isLength({ min: 6 })
    const errors = request.validationErrors();
    if (errors) {
        const firstError = errors.map(error => error.msg)[0];
        return res.status(400).json({ error: firstError });
    }
    next();
};

exports.passwordResetValidator = (req, res, next) => {
    // check for password
    req.check('newPassword', 'Mot de passe requis').notEmpty();
    req.check('newPassword')
        .isLength({ min: 6 })
        .withMessage('Le mot de passe doit faire au moins 6 caractères')
        .matches(
            /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/
        )
        .withMessage('Le mot de passe doit contenir au moins un chiffre');

    // vérifier les erreurs
    const errors = req.validationErrors();

    if (errors) {
        const firstError = errors.map(error => error.msg)[0];
        return res.status(400).json({ error: firstError });
    }

    next();
};
