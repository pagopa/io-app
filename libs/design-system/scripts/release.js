const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const repositoryRoot = path.resolve(projectRoot, "../..");
const previousVersion = require(path.join(projectRoot, "package.json")).version;
const [specifier] = process.argv.slice(2);

const run = (command, args) =>
  execFileSync(command, args, { cwd: repositoryRoot, stdio: "inherit" });

const read = (command, args) =>
  execFileSync(command, args, { cwd: repositoryRoot, encoding: "utf8" }).trim();

const previousTagCandidates = [
  `design-system-v${previousVersion}`,
  previousVersion
];
const availableTags = read("git", ["tag", "--list"])
  .split("\n")
  .filter(Boolean);
const previousTag = previousTagCandidates.find(tag =>
  availableTags.includes(tag)
);
const fromRef =
  previousTag ||
  read("git", [
    "log",
    "-1",
    "--format=%H",
    "--",
    "libs/design-system/CHANGELOG.md"
  ]);

run("pnpm", ["nx", "release", "version", specifier, "--group=design-system"]);

const version = JSON.parse(
  fs.readFileSync(path.join(projectRoot, "package.json"), "utf8")
).version;
run("pnpm", [
  "nx",
  "release",
  "changelog",
  version,
  `--from=${fromRef}`,
  "--group=design-system",
  "--git-commit-message=chore: Design-system release {version}"
]);
