// Import custom DangerJS rules.
// See http://danger.systems/js
// See https://github.com/teamdigitale/danger-plugin-digitalcitizenship/
import checkDangers from "danger-plugin-digitalcitizenship";
import {
  getPivotalStories,
  getPivotalStoryIDs
} from "danger-plugin-digitalcitizenship/dist/utils";

import { warn } from "danger";
import { DangerDSLType } from "danger/distribution/dsl/DangerDSL";
import { fromNullable } from "fp-ts/lib/Option";
declare var danger: DangerDSLType;

type StoryType = "feature" | "bug" | "chore" | "release";

const storyTag = new Map<StoryType, string>([
  ["feature", "feat: "],
  ["bug", "fix: "],
  ["chore", "chore: "]
]);

const storyOrder = new Map<StoryType, number>([
  ["feature", 2],
  ["bug", 1],
  ["chore", 0]
]);

const cleanChangelogRegex = /^(fix(\(.*\))?!?: |feat(\(.*\))?!?: |chore(\(.*\))?!?: )?(.*)$/gm;

const updatePrTitleForChangelog = async () => {
  const storyIDs = getPivotalStoryIDs(danger.github.pr.title);
  console.log("story_IDs " + storyIDs[0]);
  const stories = (await getPivotalStories(storyIDs)).filter(
    s => s.story_type !== undefined
  );
  console.log("stories " + stories[0]);
  const allStoriesSameType = stories.every(
    (val, _, arr) => val.story_type === arr[0].story_type
  );
  console.log("allStoriesSameType " + allStoriesSameType);

  if (!allStoriesSameType) {
    warn(
      "Multiple stories with different types are associated to this Pull request. " +
        "Only one tag will be added, following the order: feature > bug > chore"
    );
  }

  const storyType = stories.reduce((acc, val) => {
    const currentStoryOrder = fromNullable(storyOrder.get(val.story_type));
    const prevStoryOrder = fromNullable(storyOrder.get(acc));

    if (currentStoryOrder.isSome() && prevStoryOrder.isSome()) {
      return currentStoryOrder.value > prevStoryOrder.value
        ? val.story_type
        : acc;
    } else if (currentStoryOrder.isSome()) {
      return val.story_type;
    }
    return acc;
  }, undefined);

  console.log("storyType" + storyType);

  const rawTitle = danger.github.pr.title.match(cleanChangelogRegex)!.pop();
  const title = rawTitle !== undefined ? rawTitle : danger.github.pr.title;

  const maybeStoryTag = fromNullable(storyTag.get(storyType));
  console.log("maybeStoryTag" + maybeStoryTag);
  maybeStoryTag.map(tag =>
    danger.github.api.pulls.update({
      owner: danger.github.thisPR.owner,
      repo: danger.github.thisPR.repo,
      pull_number: danger.github.thisPR.number,
      title: `${tag}${title}`
    })
  );
};

checkDangers();
updatePrTitleForChangelog()
  .then()
  .catch();
