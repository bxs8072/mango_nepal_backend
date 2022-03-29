const nodemailer = require("nodemailer");

const resetMailData = (to, code) => {
  return `
    <p>
    We have received a password reset request for your account in <b>mangonepal.com</b> <br/>
    please visit below <b>URL</b> and reset your password <br/> <br/>
    <a href="https://mangonepal.com/reset_password?email=${to}&code=${code}">https://mangonepal.com/reset_password?email=${to}&code=${code}</a>
    </p>
 `;
};

const resetMailDataText = (to, code) => {
  return `
      We have received a password reset request for your account in mangonepal.com
      please visit below URL and reset your password
      https://mangonepal.com/reset_password?email=${to}&code=${code}
   `;
};

async function sendResetMail(to, code) {
  let transporter = nodemailer.createTransport({
    host: process.env.AWS_SES_HOST,
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.AWS_SES_USER,
      pass: process.env.AWS_SES_PW,
    },
  });

  console.log(to);

  return transporter.sendMail({
    from: '"Mango Nepal" <contact@mangonepal.com>', // sender address
    replyTo: "contact@mangonepal.com",
    to: to,
    subject: "Reset your password!", // Subject line
    text: resetMailDataText(to, code), // plain text body
    html: resetMailData(to, code), // html body
  });
}

module.exports = sendResetMail;
