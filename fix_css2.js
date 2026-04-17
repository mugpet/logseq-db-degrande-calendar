const fs = require('fs');
let code = fs.readFileSync('custom.css', 'utf8');
code = code.replace(".dgc-pagebar.is-month-view.is-minimized .dgc-day-week {}", ".dgc-pagebar.is-month-view.is-minimized .dgc-day-week {");
fs.writeFileSync('custom.css', code);
console.log("Done fixed.");
