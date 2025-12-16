/* eslint-disable functional/no-let */
/* eslint-disable no-console */
/* eslint-disable functional/immutable-data */
import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import { extractKeys, readLocaleDoc } from "./make-locales";

// NOTE TO THE READER:
// THIS SCRIPT DOES NOT DELETE ALL UNUSED LOCALES
// it does delete a big chunk of them, though!
//
// the reason for this is that some locales are accessed with a non literal notation,
// so it's best to go for a "best guess" approach, instead of risking deleting
// locales that are actually used.

/**
 * yq is a CLI yaml manipulation tool
 * which is required for this script.
 * this func installs it using Homebrew if it's not installed
 */
const installYqIfNeeded = async () => {
  const isInstalled = await new Promise(res =>
    exec("which yq", (err, stdout, _) => {
      if (err) {
        return res(false);
      }
      return res(stdout.length > 0);
    })
  );
  if (!isInstalled) {
    console.log(
      chalk.yellow(
        `yq is a yaml manipulation tool which is required for this script. 
        installing it right now...`
      )
    );
    await new Promise(res =>
      exec("brew install yq", (err, _stdout, _) => {
        if (err) {
          console.log(
            chalk.red(
              `error installing yq (https://github.com/mikefarah/yq) 
              maybe you need to install homebrew?`
            )
          );
          process.exit(1);
        }
        console.log(chalk.green("yq installation successful"));
        return res(true);
      })
    );
  } else {
    console.log(chalk.green("yay! yq is installed!"));
  }
};

/**
* since some locales are accessed with a notation like
* `key.key.key.${myVal}`,
* so we check for all possible combinations of the locale.
*
* e.g. `key.key.*.key` or `key.key.key.*`
* @param locale the locale to generate regex for

(e.g `wallet.time.now.hour`)
*/
const generatePossibleLocaleRegexChecker = (locale: string) => {
  const localeArr = [];
  const originalSplit = locale.split(".");
  for (let i = 0; i < originalSplit.length; i++) {
    const newObj = {
      ...originalSplit,
      // grep will throw an error if the first char is any
      [i]: i === 0 ? originalSplit[i] : ".*"
    };
    // escape char is needed since we're using grep regex
    // eslint-disable-next-line no-useless-escape
    localeArr.push(Object.values(newObj).join(`\.`));
  }
  return localeArr;
};

const isUnused = (input: string): Promise<boolean> => {
  const regex = generatePossibleLocaleRegexChecker(input).join("|");
  return new Promise(res => {
    exec(
      `grep -E -r "${regex}" ${path.join(__dirname, "../ts")}`,
      (err, stdout, _) => {
        if (err && err.signal === null) {
          return res(true);
        }
        return res(stdout.length === 0);
      }
    );
  });
};

/**
 * @returns an array of the locale names, like ['en', 'fr', 'es']
 */
const getAllLocaleNames = () => {
  const localeFolders = fs
    .readdirSync(path.join(__dirname, "../locales"), {
      withFileTypes: true
    })
    .filter(d => d.isDirectory());
  const localeNamesArr = localeFolders.map(d => d.name);
  console.log(
    chalk.green(
      `found ${localeNamesArr.length} locales in the project: ${localeNamesArr}`
    )
  );
  return localeNamesArr;
};

/**
 *  self explanatory, uses yq to delete a key from a locale
 * @param entry the key to delete
 * @param localeName the locale to delete the key from,
 * e.g. 'en' or 'fr'
 */
const deleteYmlEntry = (entry: string, localeName: string) =>
  new Promise(res =>
    exec(
      `yq -i 'del(.${entry})' ${path.join(
        path.join(__dirname, "../locales"),
        localeName,
        "index.yml"
      )}`,
      (err, _stdout, _) => {
        if (err) {
          console.log(chalk.red(`error deleting ${entry}`));
          return res(false);
        } else {
          console.log(chalk.grey(`deleted ${entry}`));
          return res(true);
        }
      }
    )
  );

/**
 * runs a custom script that
 * uses yq to look for null or undefined entries, skippable
 * @param locale  the locale to clean up, e.g. 'en' or 'fr'
 * @returns  a promise that resolves to true if the cleanup was successful
 */
const cleanupLocales = async (locale: string) =>
  new Promise(res =>
    exec(
      `${__dirname}/remove_empty_i18n_keys.sh ${path.join(
        __dirname,
        "../locales",
        locale,
        "index.yml"
      )}`,
      (err, _stdout, _) => {
        if (err) {
          console.log(chalk.red(`${err} error cleaning up ${locale}`));
          return res(false);
        } else {
          console.log(chalk.green(`cleaned up ${locale} locale`));
          return res(true);
        }
      }
    )
  );

const findUnused = async (root: string, locale: string) => {
  const d = await readLocaleDoc(root, locale);
  const keys = extractKeys(d.doc);
  const unusedPromises = await Promise.all(keys.map(k => isUnused(k)));
  return keys.filter((_, idx) => unusedPromises[idx]);
};

const main = async (root: string, locale: string) => {
  const localeLangNames = getAllLocaleNames();
  const unusedKeys = await findUnused(root, locale);

  if (unusedKeys.length === 0) {
    console.log(chalk.green("no unused keys found!"));
    process.exit(1);
  }
  console.log(chalk.bgBlue("checking for yq installation..."));
  await installYqIfNeeded();
  console.log(chalk.red(`found ${unusedKeys.length} unused keys, deleting...`));
  // for every locale, delete every unused key
  for (const localeName of localeLangNames) {
    console.log(
      chalk.green(
        `deleting unused keys from ${localeName.toUpperCase()} locale`
      )
    );
    for (const k of unusedKeys) {
      await deleteYmlEntry(k, localeName);
    }
    // do something to clean locale up, in order to avoid null or empty objects
    await cleanupLocales(localeName);
  }
};

main(path.join(__dirname, "../locales"), "it").then(
  () => {
    console.log("done");
  },
  () => process.exit(1)
);
