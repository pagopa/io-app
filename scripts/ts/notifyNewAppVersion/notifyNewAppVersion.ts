/* eslint-disable no-console */
import * as fs from "fs-extra";
import { slackPostMessage } from "../common/slack/postMessage";

const destinationChannel = "#prod_io";
const packagePath = "package.json";

/**
 * Send a Slack message to notify the release of a new app version in beta
 */
const main = async () => {
  const packageJson = JSON.parse(fs.readFileSync(packagePath).toString("utf8"));
  const appVersion = (packageJson.version as string).replace("-rc", "");

  await slackPostMessage(
    "È disponibile la nuova versione `" +
      appVersion +
      "` dell’app :io-app: in test interno.\n" +
      "<https://github.com/pagopa/io-app/blob/master/CHANGELOG.md|:memo: Changelog> - " +
      "<https://pagopa.atlassian.net/wiki/spaces/IOAPP/pages/345932988/Release+produzione+beta#Frequenza-rilasci|:calendar: Calendario rilasci> - " +
      "<https://pagopa.atlassian.net/wiki/spaces/IOAPP/pages/22020162/Beta+interna|:test_tube: Come partecipo alla beta interna?> - " +
      "<https://pagopa.atlassian.net/wiki/spaces/IOAPP/pages/22020162/Beta+interna#%F0%9F%90%9E-Come-segnalo-un-bug?|:ladybug: Come segnalo un bug?>\n" +
      "cc <!subteam^S02GBHCR486>",
    destinationChannel,
    false
  );
};

void main()
  .then()
  .catch(ex => console.log(`Fail to execute 'notifyNewAppVersion':\n ${ex}`));
