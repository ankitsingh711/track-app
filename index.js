const express = require('express');
const nodemailer = require('nodemailer');
const useragent = require('useragent');
const NodeCache = require('node-cache');

const app = express();
const visitCache = new NodeCache({ stdTTL: 86400 }); // Cache expires after 24 hours

// Create a transporter for nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email', // Ethereal SMTP host
  port: 587, // Ethereal SMTP port
  secure: false, // True for 465, false for other ports
  auth: {
    user: 'watson.kovacek49@ethereal.email', // Ethereal generated user
    pass: 'teeZZKUsnjmuvzFnGq', // Ethereal generated password
  },
});

app.get('/', (req, res) => {
  const ip = req.ip;
  const agent = useragent.parse(req.headers['user-agent']);
  const deviceInfo = `${agent.toAgent()} on ${agent.os.toString()}`;

  // Track visits
  let visits = visitCache.get(ip) || 0;
  visits += 1;
  visitCache.set(ip, visits);

  // Prepare email content
  const mailOptions = {
    from: 'emely.strosin14@ethereal.email',
    to: 'developerankit2127@gmail.com', // Your actual email
    subject: 'New Visitor Information',
    text: `IP Address: ${ip}\nDevice Info: ${deviceInfo}\nVisit Count: ${visits}`,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Email sent: ' + info.response);
  });

  res.send('Hey there !');
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
