const nodemailer = require("nodemailer");

const mailData = (to, code) => {
  return `
    <p>
    Welcome to <b>Mango Nepal.</b> <br/>
    Please visit below <b>URL</b> and activate your account <br/> <br/>
    <a href="https://mangonepal.com/activate?email=${to}&code=${code}">https://mangonepal.com/activate?email=${to}&code=${code}</a>
    </p>
 `;
};

const mailDataText = (to, code) => {
  return `
      Welcome to Mango Nepal.
      Please visit below URL and activate your account
      https://mangonepal.com/activate?email=${to}&code=${code}
   `;
};

async function sendActiveMail(to, code) {
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
    subject: "Activate your account!", // Subject line
    text: mailDataText(to, code), // plain text body
    html: mailData(to, code), // html body
  });
}

module.exports = sendActiveMail;
