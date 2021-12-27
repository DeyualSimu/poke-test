const fs = require('fs');
let config;
if (fs.existsSync(`${__dirname}/${process.env.NODE_ENV}.js`)) {
	config = require(`${__dirname}/${process.env.NODE_ENV}.js`);
}
else {
	config = require(`${__dirname}/development.js`);
}

module.exports = config;
