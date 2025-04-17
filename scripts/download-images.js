const fs = require('fs');
const https = require('https');
const path = require('path');

// Image URLs for different categories
const images = {
  // Destination images
  destinations: [
    'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=600&auto=format&fit=crop', // New York
    'https://images.unsplash.com/photo-1526129318478-62ddd1a59463?q=80&w=600&auto=format&fit=crop', // London
    'https://images.unsplash.com/photo-1549693578-d683be217e58?q=80&w=600&auto=format&fit=crop', // Tokyo
    'https://images.unsplash.com/photo-1551634979-2b11f8c218da?q=80&w=600&auto=format&fit=crop', // Dubai
    'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=600&auto=format&fit=crop', // Paris
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop', // Bali
  ],
  
  // Travel inspiration
  travel: [
    'https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=600&auto=format&fit=crop', // Adventure
    'https://images.unsplash.com/photo-1467139701929-18c0d27a7516?q=80&w=600&auto=format&fit=crop', // Cultural
    'https://images.unsplash.com/photo-1534008897995-27a23e859048?q=80&w=600&auto=format&fit=crop', // Luxury
    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=600&auto=format&fit=crop', // Nature
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=600&auto=format&fit=crop', // Family
    'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?q=80&w=600&auto=format&fit=crop', // Romantic
  ],
  
  // Avatar images
  avatars: [
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&auto=format&fit=crop', // Female 1
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop', // Male 1
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop', // Female 2
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop', // Male 2
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=100&auto=format&fit=crop', // Female 3
  ],
  
  // Flight routes
  flights: [
    'https://images.unsplash.com/photo-1518555122388-3476673741de?q=80&w=300&auto=format&fit=crop', // NYC-London
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=300&auto=format&fit=crop', // LA-Tokyo
    'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?q=80&w=300&auto=format&fit=crop', // Chicago-Paris
    'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=300&auto=format&fit=crop', // Miami-Barcelona
    'https://images.unsplash.com/photo-1532236204992-f5e0ce0edb39?q=80&w=300&auto=format&fit=crop', // SF-Sydney
    'https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?q=80&w=300&auto=format&fit=crop', // Dubai-Singapore
  ],
  
  // Payment logos
  payments: [
    'https://upload.wikimedia.org/wikipedia/commons/b/b9/Visa_2021.svg', // Visa
    'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg', // Mastercard
    'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg', // PayPal
    'https://upload.wikimedia.org/wikipedia/commons/7/72/Klarna_Payment_Badge_Black.svg', // Klarna
    'https://upload.wikimedia.org/wikipedia/commons/3/39/PayPal_logo.svg', // Affirm
    'https://upload.wikimedia.org/wikipedia/commons/5/57/Discover_Card_logo.svg', // Discover
    'https://upload.wikimedia.org/wikipedia/commons/4/40/Apple_Pay_logo.svg', // Apple Pay
    'https://upload.wikimedia.org/wikipedia/commons/3/36/Google_Pay_Logo.svg', // Google Pay
  ],
  
  // App mockup
  app: [
    'https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=250&auto=format&fit=crop', // App mockup
  ]
};

// Function to download an image
function downloadImage(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    
    https.get(url, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${destination}`);
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(destination);
        console.error(`Error downloading ${url}: ${err.message}`);
        reject(err);
      });
    }).on('error', (err) => {
      fs.unlink(destination);
      console.error(`Error fetching ${url}: ${err.message}`);
      reject(err);
    });
  });
}

// Download all images
async function downloadAllImages() {
  try {
    for (const [category, urls] of Object.entries(images)) {
      for (let i = 0; i < urls.length; i++) {
        const fileExt = urls[i].includes('.svg') ? 'svg' : 'jpg';
        const destination = path.join(__dirname, '..', 'public', 'images', category, `${i + 1}.${fileExt}`);
        await downloadImage(urls[i], destination);
      }
    }
    console.log('All images downloaded successfully!');
  } catch (error) {
    console.error('Error downloading images:', error);
  }
}

// Run the script
downloadAllImages(); 