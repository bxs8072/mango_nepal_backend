const stripHtml = require("string-strip-html");

module.exports = (html) => {
  return stripHtml(html, {
    onlyStripTags: ["script", "style"],
    stripTogetherWithTheirContents: ["script", "style"],
  });
};
