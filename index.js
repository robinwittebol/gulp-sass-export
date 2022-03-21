var through = require('through2');
var Vinyl = require('vinyl');
var notify = require("gulp-notify");

var exporter = require('sass-export').buffer;

var PLUGIN_NAME = 'gulp-sass-export';

module.exports = function (userOptions) {

  let options = {
    fileName: userOptions.fileName || 'sass-exported.json',
    includePaths: userOptions.dependencies || userOptions.includePaths,
    type: userOptions.type
  }

  // Create a stream to take in images
  var bufferList = [];

  var Error = notify.withReporter(function (options, callback) {
    console.log("Title:", options.title);
    console.log("Message:", options.message);
    callback();
  });

  var onData = function (file, encoding, cb) {
    if (file.isStream()) {
      this.emit("error", new Error("Streams are not supported!: Error message!"));
      return cb();
    }

    if (file.isBuffer()) {
      bufferList.push(file.contents);
      cb();
    }
  };

  // When we have completed our input
  var onEnd = function (cb) {
    if (bufferList.length === 0) {
      retStream.push(null);
      return cb();
    }

    exporter(bufferList, options).then((result) => {
      let content = new Buffer(JSON.stringify(result, null, 2));

      let file = new Vinyl({
        path: options.fileName,
        contents: content
      });

      cb(null, file);
    }).catch((err) => {
      //this.emit('error', new gutil.PluginError(PLUGIN_NAME, err.message));
      this.emit("error", new Error(err.message));

      return cb();
    });
  };

  var retStream = through.obj(onData, onEnd);
  return retStream;
};