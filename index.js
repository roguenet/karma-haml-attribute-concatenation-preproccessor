// Note, this makes use of some assumptions about the formatting of the HAML:
// 1) Any opening parens or curly brace will be immediately preceded by [a-zA-Z]
// 2) Any closing parens or curly brace that ends an attribute list is the last
//    character on the line.
var createPreprocessor = function(args, logger, helper) {
  var OPEN_REGEX = /[a-zA-Z]+([\({]).*[^\)}]$/

  var log = logger.create('preprocessor.haml');

  return function(content, file, done) {
    log.debug('Concatenating attributes in "%s".', file.originalPath);

    var lines = content.split(/\n/);
    for (var ii = 0; ii < lines.length; ii++) {
      var match = lines[ii].match(OPEN_REGEX);
      if (match) {
        var closeCharacter = match.pop() == '(' ? ')' : '}';
        var closeIndex = findClose(lines, ii, closeCharacter);
        if (closeIndex < ii) {
          log.error('No close character found [%s]!', closeCharacter);
        }

        var attributeLines = lines.splice(ii, closeCharacter - ii);
        var concatenated = attributeLines.map(function(line) { return line.trim(); }).join(' ');
        lines.splice(ii, 0, concatenated);
        log.debug('Concatenated: %s', concatenated);
      }
    }

    done(lines.join('\n'));
  };
};

var findClose = function(lines, openIndex, closeCharacter) {
  for (var ii = openIndex + 1; ii < lines.length; ii++) {
    if (lines[ii].endsWith(closeCharacter)) return ii;
  }
  return -1;
}

createHamlPreprocessor.$inject = ['args', 'logger', 'helper'];

// PUBLISH DI MODULE
module.exports = {
  'preprocessor:haml-attribute-concatenation': ['factory', createPreprocessor]
};
