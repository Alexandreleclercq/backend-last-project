const nodeMailer = require("nodemailer");

exports.sendEmail = emailData => {
  const transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.COMPTE_GMAIL,
      pass: process.env.PASS_GMAIL
    }
  });
  return transporter
    .sendMail(emailData)
    .then(info => console.log(`Message envoyé : ${info.response}`))
    .catch(err => console.log(`Problème d'envoi de l'e-mail : ${err}`));
};
