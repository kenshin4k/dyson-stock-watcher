const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'melanuryaaa@gmail.com', // Replace with your email
    pass: 'ohpb mgtd vqmx dcdh'   // Replace with your email password
  }
});

const mailOptions = {
  from: 'melanuryaaa@gmail.com',
  to: 'recipient-email@gmail.com', // Replace with recipient email
  subject: 'DYSON GELDİİİ 🎉',
  text: 'Sayın Zelal Gözde Sik, DYSON GELDİİİ. Ürünü hemen almak için tıklayın: https://www.dyson.com.tr/products/hair-care/hair-stylers/airwrap-id/airwrap-id-multi-styler-dryer-straight-wavy-jasper-plum'
};

let alreadyNotified = false;
let lastNotificationTime = 0; // Track the last notification time
const notificationInterval = 3600000; // Original interval: 1 hour

// Function to check stock
async function checkStock() {
  console.log('🌀 Checking stock…');
  try {
    const response = await axios.get('https://www.dyson.com.tr/products/hair-care/hair-stylers/airwrap-id/airwrap-id-multi-styler-dryer-straight-wavy-jasper-plum', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    const isAvailable = $('button:contains("Sepete Ekle")').length > 0; // Check if the product is in stock

    // Debug log
    console.log('DEBUG → isAvailable:', isAvailable, '| alreadyNotified:', alreadyNotified);

    const currentTime = Date.now();

    if (isAvailable) {
      // Send an email if it's the first notification or if an hour has passed since the last notification
      if (!alreadyNotified || (currentTime - lastNotificationTime) >= notificationInterval) {
        console.log('🟢 In stock! Sending email.');
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log('Email send error:', error);
            return;
          }
          console.log('Email sent:', info.response);
        });
        alreadyNotified = true;
        lastNotificationTime = currentTime; // Update the last notification time
      }
    } else {
      console.log('🔴 Still out of stock.');
      alreadyNotified = false; // Reset notification status if the product is out of stock
    }
  } catch (error) {
    console.error('Error checking stock:', error);
  }
}

// Call checkStock immediately for testing
checkStock();

// Check stock every 3 minutes
setInterval(checkStock, 180000);
