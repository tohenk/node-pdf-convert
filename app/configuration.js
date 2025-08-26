/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2025 Toha <tohenk@yahoo.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const fs = require('fs');
const path = require('path');
const Cmd = require('@ntlab/ntlib/cmd');

Cmd.addBool('help', 'h', 'Show program usage').setAccessible(false);
Cmd.addVar('config', 'c', 'Set configuration file', 'filename');
Cmd.addVar('port', 'p', 'Set server port to listen', 'port');

/**
 * Application configuration.
 *
 * @author Toha <tohenk@yahoo.com>
 */
class Configuration {

    /**
     * Constructor.
     *
     * @param {string} rootDir Configuration directory
     */
    constructor(rootDir) {
        // read configuration from command line values
        let filename = Cmd.get('config') ? Cmd.get('config') : path.join(rootDir, 'config.json');
        if (fs.existsSync(filename)) {
            const config = JSON.parse(fs.readFileSync(filename));
            Object.assign(this, config);
        }
        if (fs.existsSync(filename)) {
            console.log('Configuration loaded from %s', filename);
        }
        if (!this.workdir) {
            this.workdir = rootDir;
        }
    }

    initialize() {
        this.initialized = true;
    }

    getPath(path) {
        let rootPath = this.rootPath;
        if (rootPath) {
            if (rootPath.substr(-1) === '/') {
                rootPath = rootPath.substr(0, rootPath.length - 1);
            }
            if (rootPath) {
                path = rootPath + path;
            }
        }
        return path;
    }
}

module.exports = Configuration;
