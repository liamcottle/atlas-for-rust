/**
 * This script is used to update the asset files used in Atlas from the latest version of Rust.
 * Existing item images will not be deleted. Images are only added or updated.
 *
 * 1 - Update Rust on your PC to the latest version.
 * 2 - Run: node update_assets.js "<drive>:\SteamLibrary\steamapps\common\Rust"
 * 3 - Commit and push the changes to GitHub.
 */
const args = process.argv.slice(2);
const RustAssetManager = require('./tools/RustAssetManager');

// make sure rust path is provided
const rustPath = args[0];
if(rustPath == null || typeof(rustPath) !== "string"){
   console.error("Please provide the path to your Rust installation when running this script.");
   return;
}

// setup rust asset manager
const rustAssetManager = new RustAssetManager(rustPath);

// update items.json
rustAssetManager.writeItemsMetadata('./src/items.json');

// copy item images
rustAssetManager.copyItemImages('./public/images/items/');
