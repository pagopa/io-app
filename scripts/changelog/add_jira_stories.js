// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs-extra");

const jiraTicketBaseUrl = "https://pagopa.atlassian.net/browse/";

async function addJiraUrl(match, ticketKeys) {
  return `[${ticketKeys
    .split(",")
    // eslint-disable-next-line sonarjs/no-nested-template-literals
    .map(x => `[${x}](${new URL(x, jiraTicketBaseUrl).toString()})`)}]`;
}

async function replaceJiraStories(content) {
  // capture [JIRAID-123], avoid already linked ticket with pattern [JIRAID-123](http://jiraurl)
  const jiraTagRegex = /\[([A-Z0-9]+-\d+(,[a-zA-Z]+-\d+)*)](?!\()/g;
  return await replaceAsync(content, jiraTagRegex, addJiraUrl);
}

/**
 * replace the changelog content by removing the repetition of "closes [#idJiraStory](url)"
 * @param content
 * @return {Promise<string>}
 */
async function cleanCloses(content) {
  const closesRegex = /,\s+closes(\s+\[((#\d+)|[A-Z0-9]+-\d+)\]\(.*\))+/gm;
  return await replaceAsync(content, closesRegex, () => Promise.resolve(""));
}

async function addTasksUrls() {
  // read changelog
  const rawChangelog = fs.readFileSync("CHANGELOG.md").toString("utf8");

  const updatedChangelog = await [
    // Add jira ticket url
    replaceJiraStories,
    // clean closes
    cleanCloses
  ].reduce(
    (promiseChain, currentTask) => promiseChain.then(currentTask),
    Promise.resolve(rawChangelog)
  );
  // write the new modified changelog
  fs.writeFileSync("CHANGELOG.md", updatedChangelog);
}

/**
 * A custom method created to allows the replace in a string using an async function
 * @param str
 * @param regex
 * @param asyncFn
 * @return {Promise<*>}
 */
async function replaceAsync(str, regex, asyncFn) {
  const promises = [];
  str.replace(regex, (match, ...args) => {
    const promise = asyncFn(match, ...args);
    // eslint-disable-next-line functional/immutable-data
    promises.push(promise);
  });
  const data = await Promise.all(promises);
  // eslint-disable-next-line functional/immutable-data
  return str.replace(regex, () => data.shift());
}

// Execute the script to find jira ticket id in order to associate
// the right url in the changelog
addTasksUrls()
  // eslint-disable-next-line no-console
  .then(() => console.log("done"))
  // eslint-disable-next-line no-console
  .catch(ex => console.log(ex));
