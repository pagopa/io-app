// Import custom DangerJS rules.
// See http://danger.systems/js
import { DangerDSLType } from "danger/distribution/dsl/DangerDSL";
import { commentPrWithTicketsInfo } from "./scripts/ts/danger/commentPrWithTicketsInfo";
import { updatePrTitleForChangelog } from "./scripts/ts/danger/updatePrTitleForChangelog";
import { getTicketsFromTitle } from "./scripts/ts/danger/utils/titleParser";

declare const danger: DangerDSLType;

const mainDanger = async () => {
  const associatedStories = await getTicketsFromTitle(danger.github.pr.title);
  commentPrWithTicketsInfo(associatedStories);
  await updatePrTitleForChangelog(associatedStories);
};

void mainDanger().then().catch();
