/* eslint-disable prefer-rest-params,no-extend-native,no-underscore-dangle,class-methods-use-this */
// const path = require('path');
const fs = require('fs');
const electron = require('electron');

const { dialog } = electron.remote;
// const { args } = electron.remote;
const { ipcRenderer } = require('electron');

/**
 * Relay webview console events to the main window ----------
 */
const methods = Object.getOwnPropertyNames(console);
methods.forEach((method) => {
  const exLog = console[method];
  console[method] = function (msg) {
    exLog.apply(console, arguments);
    ipcRenderer.sendToHost(method, ...arguments);
  };
});
/**
 * ----------------------------------------------------------
 */

const portableDir = process.env.PORTABLE_EXECUTABLE_DIR;

const { call } = Function.prototype;
Function.prototype.call = function () {
  // console.log('call to ', this.name, 'ARGUMENTS', arguments);
  return call.apply(this, arguments);
};

window.addEventListener('message', (message) => {
  // console.log('Message: ', message);
});

// var devtoolElem = document.createElement("construct-devtool");

document.addEventListener('DOMContentLoaded', () => {
  // document.body.appendChild(devtoolElem);

//     let cancelInterval = setInterval(() => {
//
//         if (window.localforage) {
//             let config = {};
//             const filePath = path.join(portableDir, 'config.json');
//             if (fs.existsSync(filePath)) {
//                 config = JSON.parse(fs.readFileSync(filePath, 'utf8'));
//             }
//             console.log('your config is', config);
//
//             if (config.googleDriveToken) {
//                 window.localforage.setItem(
  //                 'C3_Cloud_Token_GOOGLE DRIVE',
  //                 config.googleDriveToken
//                 ).then(function () {
//                     return window.localforage.getItem('C3_Cloud_Token_GOOGLE DRIVE');
//                 }).then(function (value) {
//                     console.log('value', value);
//                 }).catch(function (err) {
//                     console.log('err', err);
//                 });
//             }
//
//             clearInterval(cancelInterval);
//         }
//
//     }, 100);
});

const proxyIt = el => new Proxy(el, {
  get(target, propKey) {
    console.log(`Polyfill "${propKey}"`, target[propKey], target);
    return target[propKey];
  },
});

console.log('args', process.argv);

const basename = str => str.split(/(\\|\/)/g).pop();

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
          ? new Blob(chunks, { type: mimeType })
          : new Blob(chunks);
        resolve(blob);
      })
      .once('error', reject);
  });
};

async function makeNativeFile(p) {
  console.log('Making file from ', p);

  if (!fs.existsSync(p)) {
    // create the file
    console.log('The file does not exist, creating it');
    try {
      fs.closeSync(fs.openSync(p, 'w'));
    } catch (e) {
      console.log('error', e);
    }
  }

  const stream = fs.createReadStream(p);

  let blob;
  try {
    blob = await streamToBlob(stream);
  } catch (e) {
    console.log('There was an error reading the file');
    console.log(e);
  }

  blob.lastModifiedDate = new Date();
  blob.name = basename(p);

  console.log(blob);
  return blob;
}

class FileSystemDirectoryHandle {
  constructor(p) {
    this._path = p;
    this._file = null;

    console.log('this', this);
  }

  getFile(params) {
    console.log('getFile(', params, ')');

    return this._file;
  }

  getDirectory(params) {
    console.log(`get directory(${params})`);
  }

  async* getEntries() {
    const files = fs.readdirSync(this._path);

    for (let i = 0; i < files.length; i += 1) {
      console.log('entry path', files[i]);

      const filePath = files[i];
      const file = makeNativeFile(filePath);

      yield file;
    }
    console.log('get enties');
  }
}

class FileSystemWriter {
  constructor(p, file) {
    this._file = file;
    this._path = p;
  }

  /**
   *
   * @param position
   * @param {BufferSource | Blob} data
   */
  async write(position, data) {
    return new Promise(((resolve) => {
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

class FileSystemFileHandle {
  constructor(p) {
    this._path = p;
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

  getFile(params) {
    console.log('getFile(', params, ')');

    return this._file;
  }

  createWriter(params) {
    console.log('getFile(', params, ')');

    return new FileSystemWriter(this._path, this._file);
  }

  async _init() {
    // const file = new Blob(['Hello'], {type: 'c3p', lastModified: new Date()});
    // file.name = basename(path);

    const blob = await makeNativeFile(this._path);
    this._file = blob;
  }
}


const makeFilters = filters => filters.map(({ description, extensions }) => ({
  name: description,
  extensions,
}));

window.FileSystemFileHandle = FileSystemFileHandle;
window.FileSystemDirectoryHandle = FileSystemDirectoryHandle;
window.chooseFileSystemEntries = async (params) => {
  console.log('params', params);

  if (params.type === 'saveFile') {
    const choosenPath = dialog.showSaveDialogSync({
      filters: makeFilters(params.accepts),
    });
    console.log('choosen path', choosenPath);
    const handle = new FileSystemFileHandle(choosenPath);
    await handle._init();

    console.log('handle returned from saveFile', handle);

    return handle;
  }
  const properties = [];
  let filters = null;

  if (params.type === 'openFile') {
    properties.push('openFile');
  }

  if (params.type === 'openDirectory') {
    properties.push('openDirectory');
  }

  if (params.multiple) {
    properties.push('multiSelections');
  }

  if (params.accepts && params.accepts.length > 0) {
    filters = makeFilters(params.accepts);
  }


  const result = dialog.showOpenDialogSync({
    properties,
    filters,
  });

  console.log(result);

  let handle;
  if (params.type === 'openDirectory') {
    console.log('FileSystemDirectoryHandle');
    handle = new FileSystemDirectoryHandle(result[0]);
  } else {
    handle = new FileSystemFileHandle(result[0]);
    await handle._init();
  }


  return handle;
};
