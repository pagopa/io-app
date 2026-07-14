/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs-extra");

const timestampFilePath = "./timestamp.txt";
const currentTimestamp = new Date().toISOString();

fs.writeFileSync(timestampFilePath, currentTimestamp);
