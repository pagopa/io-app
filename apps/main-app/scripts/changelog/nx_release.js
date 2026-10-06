const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const [specifier, preid] = process.argv.slice(2);
const projectRoot = path.resolve(__dirname, "../..");
const previousVersion = require(path.join(projectRoot, "package.json")).version;

if (!specifier || !preid) {
  throw new Error("Expected a version specifier and prerelease identifier");
}

const run = (command, args, cwd = projectRoot) =>
  execFileSync(command, args, { cwd, stdio: "inherit" });

run("pnpm", [
  "nx",
  "release",
  "version",
  specifier,
  `--preid=${preid}`,
  "--group=main-app",
  "--git-commit=false",
  "--git-tag=false"
]);

const version = require(path.join(projectRoot, "package.json")).version;
const versionUpdates = [
  ["ios/IO/Info.plist", require("./plist_updater.js")],
  ["ios/IO.xcodeproj/project.pbxproj", require("./pbxproj_updater.js")],
  ["android/app/build.gradle", require("./gradle_updater.js")],
  ["../../publiccode.yml", require("./publiccode_updater.js")]
];

for (const [relativePath, updater] of versionUpdates) {
  const filePath = path.resolve(projectRoot, relativePath);
  const contents = fs.readFileSync(filePath, "utf8");
  fs.writeFileSync(filePath, updater.writeVersion(contents, version));
}

run("pnpm", [
  "nx",
  "release",
  "changelog",
  version,
  `--from=${previousVersion}`,
  "--group=main-app",
  "--git-commit=false",
  "--git-tag=false",
  "--git-push=false"
]);
run(process.execPath, ["scripts/changelog/add_jira_stories.js"]);

run("git", [
  "add",
  "--",
  "package.json",
  "CHANGELOG.md",
  "ios/IO/Info.plist",
  "ios/IO.xcodeproj/project.pbxproj",
  "android/app/build.gradle",
  "../../publiccode.yml",
  "../../pnpm-lock.yaml"
]);
run("git", ["commit", "--no-verify", "-m", `chore: release ${version}`]);
run("git", ["tag", "-a", version, "-m", version]);
