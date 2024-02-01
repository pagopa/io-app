// Import custom DangerJS rules.
// See http://danger.systems/js
import { DangerDSLType } from "danger/distribution/dsl/DangerDSL";
import { commentPrWithTicketsInfo } from "./scripts/ts/danger/commentPr";
import { updatePrTitleForChangelog } from "./scripts/ts/danger/updatePrTitle";
import { getTicketsFromTitle } from "./scripts/ts/common/jiraTicket";

declare const danger: DangerDSLType;

const mainDanger = async () => {
  const associatedStories = await getTicketsFromTitle(danger.github.pr.title);
  commentPrWithTicketsInfo(associatedStories);
  await updatePrTitleForChangelog(associatedStories);
};

void mainDanger().then().catch();
