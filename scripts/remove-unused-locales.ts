/* eslint-disable no-console */
import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import { extractKeys, readLocaleDoc } from "./make-locales";

const isUnused = (input: string): Promise<boolean> =>
  new Promise(res => {
    exec(
      `grep -F -r "${input}" ${path.join(__dirname, "../ts")}`,
      (err, stdout, _) => {
        if (err) {
          return res(true);
        }
        return res(stdout.length === 0);
      }
    );
  });

const getAllLocaleNames = () => {
  const localeFolders = fs
    .readdirSync(path.join(__dirname, "../locales"), {
      withFileTypes: true
    })
    .filter(d => d.isDirectory());
  const localeNamesArr = localeFolders.map(d => d.name);
  console.log(
    chalk.green(`found ${localeNamesArr.length} locales in the project`)
  );
  return localeNamesArr;
};

const deleteYmlEntry = (entry: string, localeName: string) =>
  exec(
    // brew install yq if you don't have it
    `yq -i 'del(.${entry})' ${path.join(
      path.join(__dirname, "../locales"),
      localeName,
      "index.yml"
    )}`,
    (err, _stdout, _) => {
      if (err) {
        console.log(chalk.red(`error deleting ${entry}`));
      } else {
        console.log(chalk.grey(`deleted ${entry}`));
      }
    }
  );

const findUnused = async (root: string, locale: string) => {
  const d = await readLocaleDoc(root, locale);
  const keys = extractKeys(d.doc);
  const unusedPromises = await Promise.all(keys.map(k => isUnused(k)));
  return keys.filter((_, idx) => unusedPromises[idx]);
};

const run = async (root: string, locale: string) => {
  const localeLangNames = getAllLocaleNames();
  console.log(localeLangNames);
  const unusedKeys = await findUnused(root, locale);

  if (unusedKeys.length === 0) {
    console.log(chalk.green("no unused keys found!"));
    process.exit(1);
  }

  console.log(chalk.red(`found ${unusedKeys.length} unused keys, deleting...`));

  for (const loopLocaleName of localeLangNames) {
    if (!localeLangNames.includes(loopLocaleName)) {
      continue;
    }
    console.log(
      chalk.green(
        `deleting unused keys from ${loopLocaleName.toUpperCase()} locale`
      )
    );
    for (const entry of unusedKeys) {
      if (!unusedKeys.includes(entry)) {
        continue;
      }
      deleteYmlEntry(entry, loopLocaleName);
    }
    // do something to clean locale up, in order to avoid null or empty objects
    exec(
      `yq -i " del(.. |select(.==null or .== {})) " ` +
        path.join(__dirname, "../locales", loopLocaleName, "index.yml"),
      (err, _stdout, _) => {
        if (err) {
          console.log(chalk.red(`${err} error cleaning up ${loopLocaleName}`));
        } else {
          console.log(chalk.green(`cleaned up ${loopLocaleName}`));
        }
      }
    );
  }
};

run(path.join(__dirname, "../locales"), "en").then(
  () => {
    console.log("done");
  },
  () => process.exit(1)
);
