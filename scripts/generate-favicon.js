import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.join(process.cwd(), 'public');
const logoPath = path.join(publicDir, 'favicon.png'); // Source logo

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Check if source logo exists
if (!fs.existsSync(logoPath)) {
  console.error('❌ Source logo not found at public/favicon.png');
  console.error('Please ensure your logo is at public/favicon.png');
  process.exit(1);
}

async function generateFavicons() {
  try {
    const logoBuffer = fs.readFileSync(logoPath);

    // Generate 16x16 favicon
    const favicon16 = await sharp(logoBuffer)
      .resize(16, 16, { 
        fit: 'contain', 
        background: { r: 255, g: 255, b: 255, alpha: 0 } 
      })
      .png()
      .toBuffer();
    
    fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), favicon16);
    console.log('✓ favicon-16x16.png generated');

    // Generate 32x32 favicon (standard)
    const favicon32 = await sharp(logoBuffer)
      .resize(32, 32, { 
        fit: 'contain', 
        background: { r: 255, g: 255, b: 255, alpha: 0 } 
      })
      .png()
      .toBuffer();
    
    fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), favicon32);
    fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favicon32);
    console.log('✓ favicon-32x32.png generated');
    console.log('✓ favicon.ico generated');

    // Generate 192x192 for PWA
    const favicon192 = await sharp(logoBuffer)
      .resize(192, 192, { 
        fit: 'contain', 
        background: { r: 255, g: 255, b: 255, alpha: 0 } 
      })
      .png()
      .toBuffer();
    
    fs.writeFileSync(path.join(publicDir, 'favicon-192x192.png'), favicon192);
    console.log('✓ favicon-192x192.png generated');

    // Generate 512x512 for PWA
    const favicon512 = await sharp(logoBuffer)
      .resize(512, 512, { 
        fit: 'contain', 
        background: { r: 255, g: 255, b: 255, alpha: 0 } 
      })
      .png()
      .toBuffer();
    
    fs.writeFileSync(path.join(publicDir, 'favicon-512x512.png'), favicon512);
    console.log('✓ favicon-512x512.png generated');

    // Generate Apple Touch Icon (180x180)
    const appleIcon = await sharp(logoBuffer)
      .resize(180, 180, { 
        fit: 'contain', 
        background: { r: 255, g: 255, b: 255, alpha: 0 } 
      })
      .png()
      .toBuffer();
    
    fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);
    console.log('✓ apple-touch-icon.png generated');

    console.log('\n✅ All favicon variants generated successfully!');
    console.log('Generated files:');
    console.log('  - favicon-16x16.png (16x16)');
    console.log('  - favicon-32x32.png (32x32)');
    console.log('  - favicon.ico (32x32)');
    console.log('  - favicon-192x192.png (192x192)');
    console.log('  - favicon-512x512.png (512x512)');
    console.log('  - apple-touch-icon.png (180x180)');
  } catch (error) {
    console.error('❌ Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();
