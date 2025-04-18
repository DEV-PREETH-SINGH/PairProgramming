const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Paths
const SOURCE_LOGO = path.join(__dirname, 'src', 'assets', 'CODEBUDDY.png');
const ANDROID_RES_DIR = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

// Android icon dimensions (in pixels)
const ANDROID_ICONS = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

async function generateAndroidIcons() {
  try {
    console.log('Generating Android icons...');
    
    // Generate icons for each resolution
    for (const [directory, size] of Object.entries(ANDROID_ICONS)) {
      const targetDir = path.join(ANDROID_RES_DIR, directory);
      
      // Generate square icon
      await sharp(SOURCE_LOGO)
        .resize(size, size)
        .toFile(path.join(targetDir, 'ic_launcher.png'));
      
      // Generate round icon (same as square for now)
      await sharp(SOURCE_LOGO)
        .resize(size, size)
        .toFile(path.join(targetDir, 'ic_launcher_round.png'));
      
      console.log(`Created ${directory} icons`);
    }
    
    console.log('Android icons generated successfully!');
    
    // Also update the splash screen icon if it exists
    const splashIconPath = path.join(ANDROID_RES_DIR, 'drawable', 'splash.png');
    if (fs.existsSync(splashIconPath)) {
      await sharp(SOURCE_LOGO)
        .resize(300, 300)
        .toFile(splashIconPath);
      console.log('Updated splash screen icon');
    }
  } catch (error) {
    console.error('Error generating Android icons:', error);
  }
}

// Run the icon generation
generateAndroidIcons(); 