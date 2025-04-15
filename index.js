const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');

// Gmail ayarları - Environment variable'lar ile
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Mail içeriği
const mailOptions = {
  from: process.env.EMAIL_USER,
  to: 'recipient-email@gmail.com', // Alıcı adresini güncelle
  subject: 'DYSON GELDİİİ 🎉',
  text: 'Sayın Zelal Gözde Sik, DYSON GELDİİİ. Ürünü hemen almak için tıklayın: https://www.dyson.com.tr/products/hair-care/hair-stylers/airwrap-id/airwrap-id-multi-styler-dryer-straight-wavy-jasper-plum'
};

let alreadyNotified = false;
let lastNotificationTime = 0;
const notificationInterval = 3600000; // 1 saat

// Stok kontrol fonksiyonu
async function checkStock() {
  console.log('🌀 Checking stock…');
  try {
    const response = await axios.get('https://www.dyson.com.tr/products/hair-care/hair-stylers/airwrap-id/airwrap-id-multi-styler-dryer-straight-wavy-jasper-plum', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const isAvailable = $('button:contains("Sepete Ekle")').length > 0;

    console.log('DEBUG → isAvailable:', isAvailable, '| alreadyNotified:', alreadyNotified);
    const currentTime = Date.now();

    if (isAvailable) {
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
        lastNotificationTime = currentTime;
      }
    } else {
      console.log('🔴 Still out of stock.');
      alreadyNotified = false;
    }

  } catch (error) {
    console.error('Error checking stock:', error);
  }
}

checkStock();
setInterval(checkStock, 180000); // 3 dakikada bir kontrol
