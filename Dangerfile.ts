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
declare const danger: DangerDSLType;

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

const cleanChangelogRegex = /^(fix(\(.+\))?!?: |feat(\(.+\))?!?: |chore(\(.+\))?!?: )?(.*)$/;

/**
 * Append the changelog tag to the pull request title
 */
const updatePrTitleForChangelog = async () => {
  // detect stories id from the pr title and load the story from pivotal
  const storyIDs = getPivotalStoryIDs(danger.github.pr.title);
  const stories = (await getPivotalStories(storyIDs)).filter(
    s => s.story_type !== undefined
  );
  // check if all the stories are of the same type
  const allStoriesSameType = stories.every(
    (val, _, arr) => val.story_type === arr[0].story_type
  );
  if (!allStoriesSameType) {
    warn(
      "Multiple stories with different types are associated with this Pull request. " +
        "Only one tag will be added, following the order: feature > bug > chore"
    );
  }

  // In case of multiple stories, only one tag can be added, following the order feature > bug > chore
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

  // clean the title from existing tags (multiple commit on the same branch)
  const rawTitle = danger.github.pr.title.match(cleanChangelogRegex)?.pop();
  const title = rawTitle !== undefined ? rawTitle : danger.github.pr.title;

  // If a tag can be associated to a story, update the pr title
  const maybeStoryTag = fromNullable(storyTag.get(storyType));
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
updatePrTitleForChangelog().then().catch();
