/* eslint-disable no-console */
/**
 * This script converts the translations from the "locales"
 * directory into a typescript file that can be bundled with
 * the app and fed to react-native-i18n.
 *
 * During the conversion, the script selects one locale as the
 * "master" locale (defaults to "en").
 * For the non-master locales the script throws an error if there
 * are missing or extra keys compared to the master locale.
 *
 * The script accepts the following env vars:
 *
 * I18N_IGNORE_LOCALE_ERRORS=1    Ignore locale validation errors.
 * I18N_MASTER_LOCALE=it          Sets a different master locale.
 */

import * as path from "path";
import chalk from "chalk";
import * as fs from "fs-extra";
import * as yaml from "js-yaml";
import * as prettier from "prettier";
import * as _ from "lodash";

interface LocaleDoc {
  locale: string;
  doc: any;
}

interface LocaleDocWithKeys extends LocaleDoc {
  keys: ReadonlyArray<string>;
}

interface LocaleDocWithCheckedKeys extends LocaleDocWithKeys {
  missing: ReadonlyArray<string>;
  extra: ReadonlyArray<string>;
}

const root = path.join(__dirname, "../locales");

/**
 * Custom YAML type for including files
 */
const IncludeYamlType = (includeRoot: string) =>
  new yaml.Type("!include", {
    kind: "scalar",

    resolve: (data: any) =>
      data !== null &&
      typeof data === "string" &&
      path // included file must be under includeRoot
        .normalize(path.join(includeRoot, data))
        .startsWith(path.normalize(includeRoot)) &&
      fs.statSync(path.join(includeRoot, data)).isFile(),

    construct: data => fs.readFileSync(path.join(includeRoot, data)).toString(),

    instanceOf: String,

    represent: (data: any) => String(data)
  });

/**
 * Reads a locale document.
 *
 * TODO: support including files (e.g. markdown docs)
 */
export async function readLocaleDoc(
  rootPath: string,
  locale: string
): Promise<LocaleDoc> {
  const localePath = path.join(rootPath, locale);
  const filename = path.join(localePath, "index.yml");
  const content = await fs.readFile(filename);
  const doc = yaml.safeLoad(content.toString(), {
    filename,
    json: false,
    schema: yaml.Schema.create(IncludeYamlType(localePath))
  });
  return {
    locale,
    doc
  };
}

/**
 * Extracts all the translation keys from a parsed yaml
 */
export function extractKeys(
  subDoc: any,
  base: string = ""
): ReadonlyArray<string> {
  const baseWithDelimiter = base.length > 0 ? `${base}.` : "";
  const keys = Object.keys(subDoc);
  const terminalKeys = keys
    .filter(k => typeof subDoc[k] === "string")
    .map(k => baseWithDelimiter + k);
  const nonTerminalKeys = keys.filter(k => typeof subDoc[k] === "object");
  const subKeys = nonTerminalKeys.map(k =>
    extractKeys(subDoc[k], baseWithDelimiter + k)
  );
  const flatSubKeys = subKeys.reduce((acc, ks) => acc.concat(ks), []);
  return terminalKeys.concat(flatSubKeys).sort();
}

/**
 * Returns all elements in a that are not in b
 */
function keyDiff(a: ReadonlyArray<string>, b: ReadonlyArray<string>) {
  return a.filter(k => b.indexOf(k) < 0);
}

/**
 * Compares the keys of a locale with the master keys.
 *
 * Returns the keys in the master that are missing in the locale
 * and the extra keys in the locale that are not present in master.
 */
function compareLocaleKeys(
  masterKeys: ReadonlyArray<string>,
  localeKeys: ReadonlyArray<string>
) {
  const missing = keyDiff(masterKeys, localeKeys);
  const extra = keyDiff(localeKeys, masterKeys);
  return {
    missing,
    extra
  };
}

function reportBadLocale(locale: LocaleDocWithCheckedKeys): void {
  console.log("---");
  console.log(
    chalk.redBright(`Locale "${chalk.bold(locale.locale)}" has errors:\n`)
  );
  if (locale.missing.length > 0) {
    console.log(chalk.yellow(`${locale.missing.length} keys are missing:`));
    console.log(locale.missing.join("\n") + "\n");
  }
  if (locale.extra.length > 0) {
    console.log(
      chalk.yellow(
        `${locale.extra.length} keys are not present in the master locale:`
      )
    );
    console.log(locale.extra.join("\n") + "\n");
  }
}

const replacePlaceholders = (text: string, doc: any): string => {
  const matches = text.match(/\${.*?\}/g);
  if (matches) {
    // check if there are any placeholders
    const placeholders: any = matches
      .map(x => x.replace(/[${}]/g, ""))
      .reduce((a: any, c) => {
        // the placeholder is already mapped
        if (a[c] !== undefined) {
          return a;
        }
        // for a placeholder take the relative value held by the doc
        const valueWithPlaceholder = _.at(doc, [c])[0];
        const hook = `$\{${c}}`;
        // the value cannot find
        if (valueWithPlaceholder === undefined) {
          throw Error(
            chalk.red(`Error: cannot find placeholder with key ${hook}`)
          );
        }
        // the value is not a string
        if (_.isObject(valueWithPlaceholder)) {
          throw Error(
            chalk.red(`Error: ${hook} in not a leaf. It must be a string value`)
          );
        }
        // the placeholder value is the same where the placeholder is
        if (valueWithPlaceholder.indexOf(`$\{${c}}`) >= 0) {
          throw Error(chalk.red(`Error: recursion reference detected ${hook}`));
        }
        // build a mapping object where the key is the placeholder name
        // and the value is the placeholder value
        // ex {"obj.fieldOne.value" : "value"}
        return { ...a, [c]: valueWithPlaceholder };
      }, {});

    return Object.keys(placeholders).reduce(
      (a, c) =>
        a.replace(new RegExp(`\\$\{${c}}`, "g"), placeholders[c] as string),
      text
    );
  }
  return text;
};

/**
 * Pass through the whole locals object and replace all placeholders with their relative value.
 * A placeholder can be added using the syntax ${obj.fieldOne.value}
 * A placeholder CANNOT refer to a value containing another placeholder.
 */
const withPlaceholders = (locales: ReadonlyArray<LocaleDocWithKeys>) =>
  locales.map(l => {
    const replacedDoc = (obj: any): any =>
      Object.keys(obj).reduce((agg: any, curr) => {
        if (_.isObject(obj[curr])) {
          return { ...agg, [curr]: replacedDoc(obj[curr]) };
        }
        const value: string = obj[curr];
        const replacedValue = replacePlaceholders(value, l.doc);
        return { ...agg, [curr]: replacedValue };
      }, {});
    return { ...l, doc: replacedDoc(l.doc) };
  });

async function emitTsDefinitions(
  locales: ReadonlyArray<LocaleDocWithKeys>,
  emitPath: string
): Promise<void> {
  const localesType = locales.map(l => `"${l.locale}"`).join("|");
  const translationKeys = locales[0].keys.map(k => `  | "${k}"`).join("\n");
  const localesDeclarations = locales
    .map(
      l =>
        `export const locale${l.locale.toUpperCase()} = ${JSON.stringify(
          l.doc,
          undefined,
          2
        )};`
    )
    .join("\n");
  const content = `
/**
 * DO NOT EDIT OR COMMIT THIS FILE!
 *
 * This file has been automatically generated by scripts/make-locales.ts
 */

export type Locales = ${localesType};

export type TranslationKeys =
${translationKeys};

${localesDeclarations}
  `;

  return fs.writeFile(
    emitPath,
    prettier.format(content, { parser: "typescript" })
  );
}

async function run(rootPath: string): Promise<void> {
  try {
    console.log(chalk.whiteBright("Translations builder"));

    const masterLocale = process.env.I18N_MASTER_LOCALE || "en";

    const locales = fs
      .readdirSync(root)
      .filter(d => fs.statSync(path.join(root, d)).isDirectory())
      .sort((a, b) => (a === masterLocale ? -1 : b === masterLocale ? 1 : 0));

    if (locales.indexOf(masterLocale) < 0) {
      throw new Error(`Master locale not found: ${root}/${masterLocale}`);
    }

    console.log("Locales:", chalk.blueBright(locales.join(", ")));
    console.log("Master locale:", chalk.blueBright(masterLocale));
    console.log("Locales path:", chalk.blueBright(rootPath));

    // read the YAML files for all locales
    console.log(chalk.gray("[1/5]"), "Reading translations...");
    const localeDocs = await Promise.all(
      locales.map(async l => await readLocaleDoc(rootPath, l))
    );

    // extract the keys from all locale files
    console.log(chalk.gray("[2/5]"), "Extracting keys...");
    const localeKeys: ReadonlyArray<LocaleDocWithKeys> = localeDocs.map(d => ({
      ...d,
      keys: extractKeys(d.doc)
    }));
    // the master locale is the first one
    const masterKeys = localeKeys[0];
    console.log(
      chalk.greenBright(
        `${chalk.bold(
          String(masterKeys.keys.length)
        )} keys in master locale "${chalk.bold(masterKeys.locale)}"`
      )
    );
    const otherLocaleKeys = localeKeys.slice(1);

    // compare keys of locales with master keys
    console.log(chalk.gray("[3/5]"), "Comparing keys...");
    const checkedLocaleKeys: ReadonlyArray<LocaleDocWithCheckedKeys> = otherLocaleKeys.map(
      l => ({
        ...l,
        ...compareLocaleKeys(masterKeys.keys, l.keys)
      })
    );

    // look for locales that have missing or extra keys
    const badLocales = checkedLocaleKeys.filter(
      l => l.missing.length > 0 || l.extra.length > 0
    );

    if (badLocales.length > 0) {
      badLocales.forEach(reportBadLocale);
      if (!process.env.I18N_IGNORE_LOCALE_ERRORS) {
        throw Error("bad locales detected");
      }
    }
    console.log(chalk.gray("[4/5]"), `Baking placeholders...`);
    const replacedPlaceholders = withPlaceholders(localeKeys);

    const emitPath = path.join(rootPath, "locales.ts");
    console.log(
      chalk.gray("[5/5]"),
      `Writing locales typescript to [${emitPath}]...`
    );

    await emitTsDefinitions(replacedPlaceholders, emitPath);
  } catch (e) {
    console.log(chalk.red(e.message));
  }
}

run(root).then(
  () => console.log("done"),
  () => process.exit(1)
);
