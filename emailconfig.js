const mail = require('nodemailer');
const trans = mail.createTransport('smtps://siddheshrane24@gmail.com:yourpassword@smtp.gmail.com');
module.exports=trans;
