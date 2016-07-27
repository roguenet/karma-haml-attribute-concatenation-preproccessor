var createPreprocessor = function(logger) {
  var OPEN_REGEX = /^\s*[\.%][\-_\.#a-zA-Z]+([\({])('[^']*'|"[^"]*"|[^'"\)}])*$/;
  var CLOSE_REGEX = /^('[^']*'|"[^"]*"|[^'"])*([\)}]).*$/;

  var log = logger.create('preprocessor.haml-attribute-concatenation');

  var concatenateAttributeBlocks = function(content, file, done) {
    log.debug('Concatenating attributes in "%s".', file.originalPath);

    var lines = content.split(/\n/);
    var matched = false;
    for (var ii = 0; ii < lines.length; ii++) {
      var match = lines[ii].match(OPEN_REGEX);
      if (match) {
        matched = true;
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

  var findClose = function(lines, openIndex, closeCharacter) {
    for (var ii = openIndex + 1; ii < lines.length; ii++) {
      var match = lines[ii].match(CLOSE_REGEX);
      if (match) {
        if (match[2] != closeCharacter) {
          log.error('Found the wrong close character [%s]!', match);
          return -1;
        }

        return ii;
      }
    }
    return -1;
  };

  return concatenateAttributeBlocks;
};

createPreprocessor.$inject = ['logger'];

module.exports = {
  'preprocessor:haml-attribute-concatenation': ['factory', createPreprocessor]
};
