karma-haml-attribute-concatentation-preprocessor
================================================
> A Karma preprocessor that concatenates multiline haml attributes so that the haml-js preprocessor
doesn't choke on them.

The `haml-js` preprocessor can't handle multi-line attributes, which are valid haml
([3 year old open issue](https://github.com/creationix/haml-js/issues/74)). There is a
[patch](https://github.com/StemboltHQ/karma-haml-preprocessor/commit/f2846df2fcbb4f9614b273af3b4d8ae430e223ea)
floating around to support using the `haml` executable instead of `haml-js` for `haml` preprocessing
in Karma, but it is _much much_ slower if you have a lot of templates. This approach allows you
to continue using `haml-js` without modifying your original sources by concatenating multi-line
attributes before they get processed into HTML. The final HTML should be identical to what you
would get out of the Ruby `haml` processor.

## Installation

`karma-haml-attribute-concatenation-preprocessor` should be kept as a devDependency in your
`package.json`.
```json
{
  "devDependencies": {
    "karma-haml-attribute-concatenation-preprocessor": "^0.1.1"
  }
}
```

You can of course manage this as usual via `npm`:
```
npm install --save-dev karma-haml-attribute-concatenation-preprocessor
```

## Configuration
```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    files: [
      '*.haml'
    ],
    preprocessors: {
      '**/*.haml': ['haml-attribute-concatenation', 'haml']
    }
  });
};
```
