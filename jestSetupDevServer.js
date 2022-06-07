import { spawn, execSync } from "child_process";
import cwd from "cwd";

const logPrefix = "[DEV SERVER]";
let server = null;

beforeAll(done => {
  console.log(
    logPrefix,
    "🚀 Starting the development server in a child process..."
  );

  execSync(
    "cp ./scripts/api-config.json ./node_modules/io-dev-api-server/config/config.json",
    {
      cwd: cwd()
    }
  );

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
    done();
  });

  server.stderr.on("data", data => {
    console.error(logPrefix, data.toString());
  });
});

afterAll(() => {
  if (server) {
    console.log(logPrefix, "🔪 Killing the development server...");
    server.kill();
  }
});
