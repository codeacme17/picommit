// __mocks__/strip-json-comments.js
module.exports = function (input) {
  return input.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '')
}
