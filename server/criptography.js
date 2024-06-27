const crypto = require('crypto');

encrypt = function encrypt(input) {
	const md5Hash = crypto.createHash('md5');
	md5Hash.update(input);
	return md5Hash.digest('hex');
} // método para encriptar a password do utilizador
