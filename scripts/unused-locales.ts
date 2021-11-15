/* eslint-disable no-console */
import { exec } from "child_process";
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

const run = async (root: string, locale: string) => {
  const d = await readLocaleDoc(root, locale);
  const keys = extractKeys(d.doc);
  const unusedPromises = await Promise.all(keys.map(k => isUnused(k)));
  const unused = keys.filter((_, idx) => unusedPromises[idx]);
  if (unused.length === 0) {
    console.log(chalk.green("no unused keys found!"));
  } else {
    console.log(
      chalk.red(
        `found ${unused.length} unused keys (${(
          (unused.length / keys.length) *
          100
        ).toFixed(2)}%) [${keys.length} total]\n`
      )
    );
    console.log(chalk.yellow(`${unused.join("\n")}`));
  }
};

run(path.join(__dirname, "../locales"), "en").then(
  () => {
    console.log("done");
  },
  () => process.exit(1)
);
