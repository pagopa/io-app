import { execSync } from "child_process";
import cwd from "cwd";

beforeAll(() => {
  console.log("🏗 Setting up the development server");

  execSync(
    "cp ./scripts/api-config.json ./node_modules/io-dev-api-server/config/config.json",
    {
      cwd: cwd()
    }
  );
});
