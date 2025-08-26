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
const PdfCmd = require('.');
const debug = require('debug')('pdf:convert');

class PdfCmdConvert extends PdfCmd {

    consume(payload) {
        const { socket, data } = payload;
        return new Promise((resolve, reject) => {
            const res = {};
            if (data.content && data.filename) {
                try {
                    const libreOfficeBin = this.findLibreOfficeBinary();
                    if (!libreOfficeBin || !fs.existsSync(libreOfficeBin)) {
                        return reject('Unable to find LibreOffice binary, make sure LibreOffice has been installed!');
                    }
                    const outdir = this.getOutdir(socket.id);
                    const infile = path.join(outdir, data.filename);
                    const outfile = path.join(outdir, data.filename.substr(0, data.filename.lastIndexOf('.') + 1) + 'pdf');
                    const filext = data.filename.substr(data.filename.lastIndexOf('.') + 1)
                        .toLowerCase();
                    const exporter = {
                        doc: 'writer_pdf_Export',
                        docx: 'writer_pdf_Export',
                        ppt: 'impress_pdf_Export',
                        pptx: 'impress_pdf_Export',
                        xls: 'calc_pdf_Export',
                        xlsx: 'calc_pdf_Export',
                    }[filext];
                    fs.writeFileSync(infile, data.content);
                    const exec = require('child_process').exec;
                    const cmd = `"${libreOfficeBin}" --headless --convert-to pdf:${exporter} --outdir "${outdir}" "${infile}"`;
                    debug(cmd);
                    exec(cmd, (err, stdout, stderr) => {
                        if (err) {
                            res.error = err;
                        } else if (fs.existsSync(outfile)) {
                            res.result = fs.readFileSync(outfile);
                        }
                        fs.rmSync(outdir, {recursive: true, force: true});
                        resolve(res);
                    });
                }
                catch (err) {
                    reject(err);
                }
            } else {
                resolve(res);
            }
        });
    }

    findLibreOfficeBinary()
    {
        if (this.libreOffice === undefined) {
            this.libreOffice = null;
            if (process.platform === 'win32') {
                let binary;
                for (const programDir of ['ProgramFiles', 'ProgramFiles(x86)']) {
                    binary = path.join(process.env[programDir], 'LibreOffice', 'program', 'soffice.exe');
                    if (fs.existsSync(binary)) {
                        this.libreOffice = binary;
                        break;
                    }
                } 
            } else {
                const exec = require('child_process').execSync;
                this.libreOffice = exec('which soffice');
            }
        }
        return this.libreOffice;
    }

    getOutdir($dir)
    {
        const outdir = path.join(this.config.workdir, 'tmp', $dir);
        if (!fs.existsSync(outdir)) {
            fs.mkdirSync(outdir, {recursive: true});
        }
        return outdir;
    }
}

module.exports = PdfCmdConvert;