import { ChildProcess, spawn } from "child_process";
import cwd from "cwd";
import { isTestEnv } from "./environment";

// This is the string the `startDevServer` will wait
// in the `stdout` stream to assure that the development
// server is actually ready and listening.
const readyString = "IO App - dev server is running on";

// eslint-disable-next-line
let server: ChildProcess | null = null;

/**
 * Start the default development server. If another instance of
 * a server is currently running this function will return
 * a rejected promise.
 *
 * ⚠️ This function **MUST** be used only while using `Jest`.
 */
export function startDevServer(): Promise<void> {
  if (!isTestEnv || server !== null) {
    return Promise.reject();
  }

  // eslint-disable-next-line
  console.log("🚀 Starting the development server in a child process");

  return new Promise<void>((resolve, reject) => {
    server = spawn(
      "yarn",
      [
        "--cwd",
        "./node_modules/io-dev-api-server",
        "node",
        "./build/src/start.js"
      ],
      {
        cwd: cwd(),
        shell: "/bin/zsh"
      }
    );

    server.stdout.on("data", data => {
      if (data.toString().includes(readyString)) {
        resolve();
      }
    });

    server.stderr.on("data", data => {
      reject(data.toString());
    });
  });
}

/**
 * Teardown the active development server. If another server
 * has been started using `startDevServer` then this function
 * must be called before creating another one.
 *
 * ⚠️ This function **MUST** be used only while using `Jest`.
 */
export function teardownDevServer(): void {
  if (!isTestEnv) {
    return;
  }

  if (server !== null) {
    // eslint-disable-next-line
    console.log("🔪 Killing the development server");
    server.kill();
    server = null;
  }
}
