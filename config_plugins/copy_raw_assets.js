const fs = require('fs');
const path = require('path');
const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Plugin that copies all files from a source folder into android/res/raw
 * Compatible with Expo SDK 54
 */
module.exports = function (config, options = {}) {
  const sourceDir = options.source || './assets';

  return withAndroidManifest(config, async (config) => {
    const projectRoot = config.modRequest.projectRoot;
    const androidRawPath = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'raw');

    // Ensure raw folder exists
    if (!fs.existsSync(androidRawPath)) {
      fs.mkdirSync(androidRawPath, { recursive: true });
    }

    const sourcePath = path.resolve(projectRoot, sourceDir);
    if (!fs.existsSync(sourcePath)) {
      console.warn(`Source folder "${sourceDir}" does not exist.`);
      return config;
    }

    // Copy all files from sourcePath to androidRawPath
    const files = fs.readdirSync(sourcePath);
    files.forEach((file) => {
      const srcFile = path.join(sourcePath, file);
      const destFile = path.join(androidRawPath, file);
      fs.copyFileSync(srcFile, destFile);
      console.log(`Copied ${srcFile} → ${destFile}`);
    });

    return config;
  });
}