'use strict';
var fs = require('browserify-fs');
import { FILE_NAME } from '../config/constants';

// generate a new json file using given json data object
const createFile = (obj) => {
    let data = JSON.stringify(obj, null, 2);
    fs.writeFile(FILE_NAME, data, (err) => {
        if (err) throw err;
        console.log('Data written to file successfully.');
    });
}

// read json file using file path
const readFile = (path, callback) => {
    fs.readFile(path, 'utf-8', function(err, data) {
        if (err) return callback(err)
        callback(JSON.parse(data || null));
	});
}

export default createFile;
export { readFile };
