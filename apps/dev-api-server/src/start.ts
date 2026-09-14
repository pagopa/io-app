import chalk from "chalk";
import child_process from "child_process";
import { cli } from "cli-ux";
import figlet from "figlet";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import { routes } from "./payloads/response";
import populatePersistence from "./populate-persistence";
import app from "./server";
import { readFileAsJSON } from "./utils/file";
import { interfaces, serverHostname, serverPort } from "./utils/server";
// read package.json to print some info
const packageJson = readFileAsJSON("./package.json");

// inject mock data in the messages store
populatePersistence();

// eslint-disable-next-line @typescript-eslint/no-misused-promises
app.listen(serverPort, serverHostname, async () => {
  child_process.exec("git branch --show-current", (err, stdout) => {
    cli.table([...routes], {
      method: {
        minWidth: 6,
        header: "method"
      },
      path: {
        header: "path"
      },
      description: {
        header: "description",
        get(row): string {
          return pipe(
            O.fromNullable(row.description),
            // eslint-disable-next-line:no-nested-template-literals
            O.map(d => `(${d})`),
            O.getOrElse(() => "")
          );
        }
      }
    });
    // eslint-disable-next-line no-console
    console.log(
      chalk.bgBlue(chalk.white(figlet.textSync(packageJson.pretty_name)))
    );
    // eslint-disable-next-line no-console
    console.log(
      chalk.bgBlack(
        chalk.green(
          `\n${
            packageJson.pretty_name
          } is running on\n- branch "${chalk.bgWhite(
            stdout.replace("\n", "")
          )}"\n${interfaces
            .map(({ address }) => {
              const fullUrl = `http://${address}:${serverPort}`;
              return `- ${chalk.underline(fullUrl)}`;
            })
            .join("\n")}`
        )
      )
    );
  });
});
