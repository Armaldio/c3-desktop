var call = Function.prototype.call;
Function.prototype.call = function () {
    console.log('call to ', this.name, 'ARGUMENTS', arguments);
    return call.apply(this, arguments);
};

window.addEventListener('message', message => {
    console.log('Message: ', message);
});

const proxyIt = (el) => new Proxy(el, {
    get(target, propKey) {
        console.log(`Polyfill "${propKey}"`, target[propKey], target);
        return target[propKey];
    },
});

const electron = require('electron');
const dialog = electron.remote.dialog;
const fs = require('fs');

const basename = (str) => {
    return str.split(/(\\|\/)/g).pop();
};

const streamToBlob = (stream, mimeType) => {
    if (mimeType != null && typeof mimeType !== 'string') {
        throw new Error('Invalid mimetype, expected string.');
    }
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream
            .on('data', chunk => chunks.push(chunk))
            .once('end', () => {
                const blob = mimeType != null
                    ? new Blob(chunks, {type: mimeType})
                    : new Blob(chunks);
                resolve(blob);
            })
            .once('error', reject);
    });
};

class FileSystemDirectoryHandle {
    constructor(path) {
        this._path = path;
        this._file = null;

        console.log('this', this);
    }

    getFile(args) {
        console.log('getFile(', args, ')');

        return this._file;
    }

    getDirectory(args) {
        console.log('get directory(' + args + ')');
    }

    async* getEntries() {
        const files = fs.readdirSync(this._path);

        for (let i = 0; i < files.length; i++) {
            console.log('entry path', files[i]);

            const filePath = files[i];
            const file = makeNativeFile(filePath);

            yield file;
        }
        console.log('get enties');
    }
}

async function makeNativeFile(path) {

    console.log('Making file from ', path);

    if (!fs.existsSync(path)) {
        // create the file
        console.log('The file does not exist, creating it');
        try {
            fs.closeSync(fs.openSync(path, 'w'));
        } catch (e) {
            console.log('error', e);
        }
    }

    const stream = fs.createReadStream(path);

    let blob;
    try {
        blob = await streamToBlob(stream);
    } catch (e) {
        console.log('There was an error reading the file');
        console.log(e);
    }

    blob.lastModifiedDate = new Date();
    blob.name = basename(path);

    console.log(blob);
    return blob;
}

class FileSystemFileHandle {
    constructor(path) {
        this._path = path;
        this._file = null;
    }

    get isFile() {
        const stats = fs.lstatSync(this._path);
        return stats.isFile();
    }

    get isFolder() {
        const stats = fs.lstatSync(this._path);
        return stats.isFolder();
    }

    get name() {
        return basename(this._path);
    }

    getFile(args) {
        console.log('getFile(', args, ')');

        return this._file;
    }

    createWriter(args) {
        console.log('getFile(', args, ')');

        return new FileSystemWriter(this._path, this._file);
    }

    async _init() {
        // const file = new Blob(['Hello'], {type: 'c3p', lastModified: new Date()});
        // file.name = basename(path);

        const blob = await makeNativeFile(this._path);
        this._file = blob;
    }
}

class FileSystemWriter {
    constructor(path, file) {
        this._file = file;
        this._path = path;
    }

    /**
     *
     * @param position
     * @param {BufferSource | Blob} data
     */
    async write(position, data) {
        return new Promise((resolve => {

            console.log('write', position, data);
            const fileReader = new FileReader();
            fileReader.onload = () => {
                console.log('Writing to ', this._path);
                console.log('Writing data ', Buffer.from(new Uint8Array(fileReader.result)));

                fs.writeFileSync(this._path, Buffer.from(new Uint8Array(fileReader.result)));
                resolve(true);
            };
            fileReader.readAsArrayBuffer(data);
        }));
    }

    truncate(size) {
        console.log('truncate', size);
    }

    close() {
        console.log('close');
    }

}

const makeFilters = (filters) => {
    return filters.map(({description, extensions}) => ({
        name: description,
        extensions: extensions
    }));
};

window.FileSystemFileHandle = FileSystemFileHandle;
window.FileSystemDirectoryHandle = FileSystemDirectoryHandle;
window.chooseFileSystemEntries = async (args) => {
    console.log('args', args);

    if (args.type === 'saveFile') {
        const choosenPath = dialog.showSaveDialogSync({
            filters: makeFilters(args.accepts)
        });
        console.log('choosen path', choosenPath);
        const handle = new FileSystemFileHandle(choosenPath);
        await handle._init();

        console.log('handle returned from saveFile', handle);

        return handle;
    } else {
        const properties = [];
        let filters = null;

        if (args.type === 'openFile') {
            properties.push('openFile');
        }

        if (args.type === 'openDirectory') {
            properties.push('openDirectory');
        }

        if (args.multiple) {
            properties.push('multiSelections');
        }

        if (args.accepts && args.accepts.length > 0) {
            filters = makeFilters(args.accepts);
        }


        const result = dialog.showOpenDialogSync({
            properties,
            filters
        });

        console.log(result);

        let handle;
        if (args.type === 'openDirectory') {
            console.log('FileSystemDirectoryHandle');
            handle = new FileSystemDirectoryHandle(result[0]);
        } else {
            handle = new FileSystemFileHandle(result[0]);
            await handle._init();
        }


        return handle;
    }
};
