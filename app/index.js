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

const Cmd = require('@ntlab/ntlib/cmd');
const Configuration = require('./configuration');
const PdfCmd = require('../cmd');
const { Socket } = require('socket.io');
const debug = require('debug')('pdf:app');

/**
 * Main application entry point.
 *
 * @author Toha <tohenk@yahoo.com>
 */
class App {

    VERSION = 'PDF-CONVERT-1.0'

    /** @type {Configuration} */
    config = {}

    /** @type {Socket[]} */
    sockets = []

    /**
     * Constructor.
     *
     * @param {string} rootDir Application configuration root directory
     */
    constructor(rootDir) {
        this.rootDir = rootDir;
    }

    initialize() {
        this.config = new Configuration(this.rootDir);
        this.config.initialize();
        return this.config.initialized;
    }

    createServer(serve = true) {
        const { createServer } = require('http');
        const { Server } = require('socket.io');
        const http = createServer();
        const port = Cmd.get('port') || 5000;
        if (serve) {
            const opts = {};
            if (this.config.rootPath) {
                opts.path = this.config.getPath('/socket.io/');
            }
            if (this.config.cors) {
                opts.cors = this.config.cors;
            } else {
                opts.cors = {origin: '*'};
            }
            const io = new Server(http, opts);
            const ns = io.of('/pdf')
                .on('connection', socket => {
                    this.handleConnection(socket);
                })
            ;
            if (this.config.token) {
                ns.use((socket, next) => {
                    const auth = socket.handshake.headers.authorization;
                    if (auth) {
                        const token = auth.replace('Bearer ', '');
                        if (token === this.config.token) {
                            return next();
                        }
                    }
                    debug('Client %s is using invalid authorization', socket.id);
                    next(new Error('Invalid authorization'));
                });
            }
        }
        http.listen(port, () => {
            console.log('Application ready on port %s...', port);
        });
    }

    registerCommands() {
        PdfCmd.register(this);
    }

    handleConnection(socket) {
        console.log('Client connected: %s', socket.id);
        PdfCmd.handle(socket);
    }

    run() {
        if (this.initialize()) {
            this.registerCommands();
            this.createServer();
            return true;
        } else {
            usage();
        }
    }
}

module.exports = App;
