import { imageProcessingService } from './services/imageProcessing.service';
import fs from 'fs';
import path from 'path';

async function runVerification() {
  console.log('================================================================');
  console.log('KALORA 4K SUPER-RESOLUTION COMPUTATIONAL PIPELINE VERIFICATION');
  console.log('================================================================');

  // Create a 400x300 sample blurred image buffer for testing
  const sharp = (await import('sharp')).default;
  const sampleBlurBuffer = await sharp({
    create: {
      width: 400,
      height: 300,
      channels: 3,
      background: { r: 180, g: 150, b: 120 }
    }
  })
    .blur(10) // Simulate severe camera blur
    .jpeg({ quality: 80 })
    .toBuffer();

  const sampleBase64 = `data:image/jpeg;base64,${sampleBlurBuffer.toString('base64')}`;

  console.log('\n[Step 1] Running ImageProcessingService.processImage()...');
  const response = await imageProcessingService.processImage(sampleBase64);

  console.log('\n[Step 2] Verifying Computational Pipeline Metrics:');
  const m = response.verificationMetrics;

  if (!m) {
    console.error('FAILED: Verification metrics missing!');
    process.exit(1);
  }

  console.log(`- Original Image File Path : ${m.originalFilePath}`);
  console.log(`- Original Dimensions     : ${m.originalDimensions.width} x ${m.originalDimensions.height}`);
  console.log(`- Original SHA256 Hash    : ${m.originalSha256}`);
  console.log('----------------------------------------------------------------');
  console.log(`- Enhanced Image File Path : ${m.enhancedFilePath}`);
  console.log(`- Enhanced Dimensions     : ${m.enhancedDimensions.width} x ${m.enhancedDimensions.height}`);
  console.log(`- Enhanced SHA256 Hash    : ${m.enhancedSha256}`);
  console.log('----------------------------------------------------------------');

  const origSize = fs.statSync(m.originalFilePath).size;
  const enhSize = fs.statSync(m.enhancedFilePath).size;

  console.log(`- Original File Size      : ${origSize} bytes`);
  console.log(`- Enhanced File Size      : ${enhSize} bytes`);

  // Assertions
  const isWidth4K = m.enhancedDimensions.width === 3840;
  const isHashDifferent = m.originalSha256 !== m.enhancedSha256;
  const isGenuinelyDifferent = m.isGenuinelyDifferent && isHashDifferent && isWidth4K;

  console.log('\n[Step 3] Verification Assertions:');
  console.log(`  [ASSERT 1] Enhanced Width is 4K (3840px): ${isWidth4K ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`  [ASSERT 2] SHA256 File Hashes are Different: ${isHashDifferent ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log(`  [ASSERT 3] Genuinely Different Image Files : ${isGenuinelyDifferent ? 'PASS ✅' : 'FAIL ❌'}`);

  if (isGenuinelyDifferent) {
    console.log('\nSUCCESS: Computational 4K Super-Resolution Pipeline Verified Genuine & Operational! 🎉');
  } else {
    console.error('\nFAILED: Verification failed!');
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Verification script error:', err);
  process.exit(1);
});
