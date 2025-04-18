/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 * @author Russell Parker <russell@benchling.com>
 *
 * Implements some browser-only global variables for Node.js environment.
 * These workarounds will also work in browsers as usual.
 */
/** Determines whether the current code is running in Node.js */
export const RUNNING_IN_NODEJS = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
/** Like `XMLHttpRequest` but works also in Node.js */
export const XMLHttpRequest_ = getXMLHttpRequest();
/** Like `File` but works also in Node.js */
export const File_ = getFile();
function getXMLHttpRequest() {
    if (typeof XMLHttpRequest === 'undefined' || RUNNING_IN_NODEJS) {
        return require('xhr2');
    }
    else {
        return XMLHttpRequest;
    }
}
function getFile() {
    if (typeof File === 'undefined' || RUNNING_IN_NODEJS) {
        class File_NodeJs {
            arrayBuffer() { return this.blob.arrayBuffer(); }
            slice(start, end, contentType) { return this.blob.slice(start, end, contentType); }
            stream() { return this.blob.stream(); }
            text() { return this.blob.text(); }
            bytes() { return this.blob.bytes(); }
            constructor(fileBits, fileName, options) {
                var _a;
                this.blob = new Blob(fileBits, options);
                // Blob fields
                this.size = this.blob.size;
                this.type = this.blob.type;
                // File fields
                this.name = fileName;
                this.lastModified = (_a = options === null || options === void 0 ? void 0 : options.lastModified) !== null && _a !== void 0 ? _a : 0;
                this.webkitRelativePath = '';
            }
        }
        return File_NodeJs;
    }
    else {
        return File;
    }
}
