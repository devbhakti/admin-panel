const { localize } = require('./devbhakti-backend/src/utils/localization');

const user = {
    id: "cmo8h5zk00003hu9b5ft8ca9j",
    name: '{"en":"Kashi Temple Admin","hi":"","mr":""}',
    phone: "+919977132458",
    email: "kashi@temple.com",
    role: "INSTITUTION"
};

console.log("Localizing with lang=mr:");
const localized = localize(user, 'mr');
console.log(JSON.stringify(localized, null, 2));

const userEscaped = {
    name: '"{\\"en\\":\\"Kashi Temple Admin\\",\\"hi\\":\\"\\",\\"mr\\":\\"\\"}"'
};
console.log("\nLocalizing with escaped string:");
console.log(JSON.stringify(localize(userEscaped, 'mr'), null, 2));
