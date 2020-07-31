// Import custom DangerJS rules.
// See http://danger.systems/js
// See https://github.com/teamdigitale/danger-plugin-digitalcitizenship/
import checkDangers from "danger-plugin-digitalcitizenship";
import {
  getPivotalStories,
  getPivotalStoryIDs
} from "danger-plugin-digitalcitizenship/dist/utils";

import { DangerDSLType } from "danger/distribution/dsl/DangerDSL";
declare var danger: DangerDSLType;

const updatePrTitleForChangelog = async () => {
  const storyIDs = getPivotalStoryIDs(danger.github.pr.title);
  console.log("story_IDs " + storyIDs[0]);
  const stories = await getPivotalStories(storyIDs);
  console.log("story_IDs " + stories[0]);

  // danger.github.api.pulls.update({
  //   owner: danger.github.thisPR.owner,
  //   repo: danger.github.thisPR.repo,
  //   pull_number: danger.github.thisPR.number,
  //   title: "danger test!"
  // });
};

checkDangers();
updatePrTitleForChangelog()
  .then()
  .catch();
