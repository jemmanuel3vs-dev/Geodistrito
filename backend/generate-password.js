const bcrypt = require("bcryptjs");

bcrypt.hash("Captura123", 10).then(hash => {
    console.log(hash);
});