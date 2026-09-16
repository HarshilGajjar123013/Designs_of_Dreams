const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const dashbordPublic = path.join(rootDir, 'Dashbord/public');
const dashbordApp = path.join(rootDir, 'Dashbord/src/app');
const dodshopPublic = path.join(rootDir, 'dodshop/public');
const dodshopApp = path.join(rootDir, 'dodshop/src/app');

// Find authentic DOD logo.png
let dodLogoPath = path.join(dodshopPublic, 'logo.png');
if (!fs.existsSync(dodLogoPath)) {
  dodLogoPath = path.join(dashbordPublic, 'logo.png');
}

console.log('Using DOD logo from:', dodLogoPath);

// Copy to Dashbord
fs.copyFileSync(dodLogoPath, path.join(dashbordPublic, 'logo.png'));
fs.copyFileSync(dodLogoPath, path.join(dashbordPublic, 'icon.png'));
fs.copyFileSync(dodLogoPath, path.join(dashbordPublic, 'favicon.ico'));
fs.copyFileSync(dodLogoPath, path.join(dashbordApp, 'favicon.ico'));

// Copy to dodshop
fs.copyFileSync(dodLogoPath, path.join(dodshopPublic, 'logo.png'));
fs.copyFileSync(dodLogoPath, path.join(dodshopPublic, 'icon.png'));
fs.copyFileSync(dodLogoPath, path.join(dodshopPublic, 'favicon.ico'));
if (fs.existsSync(dodshopApp)) {
  fs.copyFileSync(dodLogoPath, path.join(dodshopApp, 'favicon.ico'));
}

console.log('✅ Updated favicon.ico and title icons in Dashbord and dodshop with official DOD logo!');
