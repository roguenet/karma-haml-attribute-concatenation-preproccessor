// Note, this makes use of some assumptions about the formatting of the HAML:
// 1) Any opening parens or curly brace will be immediately preceded by [a-zA-Z]
// 2) Any closing parens or curly brace that ends a multi-line attribute list is the last
//    character on the line.
var createPreprocessor = function(logger) {
  var OPEN_REGEX = /^\s*[\.%][\-_\.#a-zA-Z]+([\({])('[^']*'|"[^"]*"|[^'"\)}])*$/;

  var log = logger.create('preprocessor.haml-attribute-concatenation');

  return function(content, file, done) {
    log.debug('Concatenating attributes in "%s".', file.originalPath);

    var lines = content.split(/\n/);
    for (var ii = 0; ii < lines.length; ii++) {
      var match = lines[ii].match(OPEN_REGEX);
      if (match) {
        var closeCharacter = match[1] == '(' ? ')' : '}';
        var closeIndex = findClose(lines, ii, closeCharacter);
        if (closeIndex < ii) {
          log.error('No close character found [%s]!', closeCharacter);
          continue;
        }

        var attributeLines = lines.splice(ii, closeIndex - ii + 1);
        var concatenated = attributeLines.map(function(line) { return line.trim(); }).join(' ');
        lines.splice(ii, 0, concatenated);
        log.debug('Concatenated: [%s, %s] %s', ii + 1, closeIndex + 1, concatenated);
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
};

createPreprocessor.$inject = ['logger'];

// PUBLISH DI MODULE
module.exports = {
  'preprocessor:haml-attribute-concatenation': ['factory', createPreprocessor]
};
