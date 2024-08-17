require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const useragent = require('useragent');
const requestIp = require('request-ip');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const visitCache = new NodeCache({ stdTTL: 86400 });

// Create a transporter for nodemailer using a real SMTP service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.get('/', async (req, res) => {
  // Get the correct IP address
  let ip = requestIp.getClientIp(req);

  // Check if IP is localhost and replace with a public IP for testing
  if (ip === '::1' || ip === '127.0.0.1') {
    ip = '8.8.8.8'; // Use a public IP like Google DNS for testing
  }

  const agent = useragent.parse(req.headers['user-agent']);
  const deviceInfo = `${agent.toAgent()} on ${agent.os.toString()}`;

  // Track visits
  let visits = visitCache.get(ip) || 0;
  visits += 1;
  visitCache.set(ip, visits);

  // Get the user's location based on their IP address
  let location = 'Location not found';
  try {
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    const data = response.data;

    location = `${data.city || 'N/A'}, ${data.region || 'N/A'}, ${data.country_name || 'N/A'}`;
  } catch (error) {
    console.log('Error fetching location:', error.message);
  }

  // Prepare email content
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'developerankit2127@gmail.com',
    subject: 'New Visitor Information',
    text: `IP Address: ${ip}\nDevice Info: ${deviceInfo}\nVisit Count: ${visits}\nLocation: ${location}`,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Email sent: ' + info.response);
  });

  res.send('Your visit has been logged.');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
