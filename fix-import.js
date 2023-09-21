
const fs = require("fs");
const url = "https://cdn.jsdelivr.net/npm/showcqt@1.2.1/showcqt.mjs";
const filename = "showcqt-element.mjs";
const str = fs.readFileSync(filename, "utf8");
const new_str = str.replace(url, "showcqt");
fs.writeFileSync(filename, new_str, "utf8");
