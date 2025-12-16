/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs-extra");

const gradlePath = "./android/app/build.gradle";
const versionCodeRegex = /(versionCode )([0-9]+)/gm;

function readAndroidBuildCode() {
  const contents = fs.readFileSync(gradlePath).toString("utf8");

  console.log(versionCodeRegex.exec(contents)[2]);
}

readAndroidBuildCode();
