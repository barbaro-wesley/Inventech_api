const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

async function enviarEmail(emailData) {
  try {
    const mailOptions = {
      from: emailData.from || process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
}

async function testarConexao() {
  try {
    await transporter.verify();
    console.log('Conexão com servidor de email estabelecida');
    return true;
  } catch (error) {
    console.error('Erro na conexão com servidor de email:', error);
    return false;
  }
}

module.exports = { enviarEmail, testarConexao };