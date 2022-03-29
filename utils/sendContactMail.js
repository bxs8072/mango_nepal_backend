const nodemailer = require("nodemailer");

const mailData = (body) => {
  return `
    <p>
    Somebody Contacted to <b>Mango Nepal</b> from Contact Us Page <br/>
    <br/>
    <b>Name: </b> ${body.name || "n/a"} <br/>
    <b>Email: </b> ${body.email || "n/a"} <br/>
    <b>Phone: </b> ${body.phone || "n/a"} <br/>
    <b>Subject: </b> ${body.contact_for || "n/a"} <br/>
    <b>Message: </b> <br/> ${body.message || "n/a"} <br/>
    </p>
 `;
};

const mailDataText = (body) => {
  return `
    Somebody Contacted to Mango Nepal from Contact Us Page \n
    Name: ${body.name || "n/a"} \n
    Email: ${body.email || "n/a"} \n
    Phone: ${body.phone || "n/a"} \n
    Subject: ${body.contact_for || "n/a"} \n
    Message: ${body.message || "n/a"} 
   `;
};

async function sendContactUsMail(to, body, replyEmail) {
  let transporter = nodemailer.createTransport({
    host: process.env.AWS_SES_HOST,
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.AWS_SES_USER,
      pass: process.env.AWS_SES_PW,
    },
  });

  return transporter.sendMail({
    from: '"Mango Nepal" <contact@mangonepal.com>', // sender address
    replyTo: replyEmail,
    to: to,
    subject: "Request in contact us, Mango Nepal", // Subject line
    text: mailDataText(body), // plain text body
    html: mailData(body), // html body
  });
}

module.exports = sendContactUsMail;
