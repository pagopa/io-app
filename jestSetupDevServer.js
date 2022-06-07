import { spawn, execSync } from "child_process";
import cwd from "cwd";

let server = null;

beforeAll(done => {
  console.log("Starting development server in a child process...");

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
});

afterAll(done => {
  if (server) {
    server.kill();
  }
});
