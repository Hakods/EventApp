const nodemailer = require('nodemailer');

// E-posta gönderim ayarları
const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    auth: {
        user: 'hakodss20@gmail.com',
        pass: 'yyud wmip ypbb rgbf'
    }
});

// E-posta gönderme fonksiyonu
const sendEmail = async (recipient, subject, message) => {
    const mailOptions = {
        from: 'hakodss20@gmail.com',
        to: recipient,
        subject: subject,
        text: message
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('E-posta gönderildi:', info.messageId);
    } catch (error) {
        console.error('E-posta gönderilirken hata oluştu:', error);
    }
};

module.exports = sendEmail;