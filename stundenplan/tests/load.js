// Lädt die App-Module in Node (globalThis.SW)
const path = require('path');
for (const f of ['util', 'model', 'store', 'domain', 'solver', 'seed']) require(path.join(__dirname, '..', 'js', f + '.js'));
module.exports = globalThis.SW;
