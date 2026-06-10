const fs = require("fs");
const path = "c:/Users/admin/Downloads/DevBhakti-master/DevBhakti-master/devbhakti-frontend/src/app/admin/temples/page.tsx";
const text = fs.readFileSync(path, "utf8");
const regex = /title=\"View Details\"/g;
const matches = text.match(regex) || [];
console.log(matches.length);
console.log(text.indexOf('title="View Details"'));
console.log(text.slice(text.indexOf('title="View Details"')-200, text.indexOf('title="View Details"')+200));
