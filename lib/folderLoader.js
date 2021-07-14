const async = require("async");
const path = require('path')
const fs = require('fs')

function folderLoader(dir, callback) {
    var controllers = {}

    fs.readdir(dir, (err, entries) => {
        if (err) return callback(err)

        async.each(entries, (entry, next) => {
            var target = path.join(dir, entry)
            var ext = path.extname(target)
            var basename = path.basename(target, ext)

            if (fs.lstatSync(target).isDirectory()){
                folderLoader(target, (err, controller) => {
                    if (err) return next(err)

                    controllers[basename] = controller
                    next()
                })
            } else {
                controllers[basename] = require(target)
                next()
            }
        }, (err) => {
            if (err) return callback(err)
            
            callback(null, controllers)
        })
    })
}

module.exports = folderLoader