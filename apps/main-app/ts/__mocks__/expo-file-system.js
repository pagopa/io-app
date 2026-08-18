const documentDirectory = "file:///mock/document/";
const cacheDirectory = "file:///mock/cache/";
const bundleDirectory = "file:///mock/bundle/";

class FileSystemFile {
  constructor(uri) {
    this.uri = uri;
    this.exists = false;
  }
  validatePath() {}
  textSync() {}
  base64Sync() {}
  bytesSync() {}
  open() {}
  info() {}
  write() {}
  delete() {}
  create() {}
  copy() {}
  move() {}
  rename() {}
  async text() {}
  async base64() {}
  async bytes() {}
}

class FileSystemDirectory {
  constructor(uri) {
    this.uri = uri;
    this.exists = false;
  }
  info() {}
  validatePath() {}
  delete() {}
  create() {}
  copy() {}
  move() {}
  rename() {}
  listAsRecords() {}
  createFile() {}
  createDirectory() {}
}

const Paths = {
  document: new FileSystemDirectory(documentDirectory),
  cache: new FileSystemDirectory(cacheDirectory),
  bundle: new FileSystemDirectory(bundleDirectory),
};

module.exports = {
  documentDirectory,
  cacheDirectory,
  bundleDirectory,
  File: FileSystemFile,
  Directory: FileSystemDirectory,
  Paths,
  downloadAsync: jest.fn().mockResolvedValue({ status: 200, uri: "" }),
  getInfoAsync: jest.fn().mockResolvedValue({ exists: false }),
  deleteAsync: jest.fn().mockResolvedValue(undefined),
  moveAsync: jest.fn().mockResolvedValue(undefined),
  copyAsync: jest.fn().mockResolvedValue(undefined),
  makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
  readDirectoryAsync: jest.fn().mockResolvedValue([]),
  readAsStringAsync: jest.fn().mockResolvedValue(""),
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
};
