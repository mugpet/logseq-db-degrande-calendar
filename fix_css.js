const fs = require('fs');
let code = fs.readFileSync('custom.css', 'utf8');
code = code.replace(/ *\.dgc-month-minimize \{[^}]+?\}[ \n]* *\.dgc-month-minimize:hover \{[^}]+?\}[ \n]*/gs, '');
fs.writeFileSync('custom.css', code);
console.log("Done");
