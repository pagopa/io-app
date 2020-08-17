// Import custom DangerJS rules.
import { warn } from "danger";
// See http://danger.systems/js
// See https://github.com/teamdigitale/danger-plugin-digitalcitizenship/
import checkDangers from "danger-plugin-digitalcitizenship";
import {
  getPivotalStories,
  getPivotalStoryIDs
} from "danger-plugin-digitalcitizenship/dist/utils";
import { DangerDSLType } from "danger/distribution/dsl/DangerDSL";
import { fromNullable, none, Option } from "fp-ts/lib/Option";

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

const allowedScope = new Map<string, string>([
  ["general", "General"],
  ["android", "Android"],
  ["ios", "iOS"],
  ["bonus_vacanze", "Bonus Vacanze"],
  ["messages", "Messages"],
  ["payments", "Payments"],
  ["services", "Services"],
  ["profile", "Profile"],
  ["privacy", "Privacy"],
  ["security", "Security"],
  ["accessibility", "Accessibility"]
]);

const cleanChangelogRegex = /^(fix(\(.+\))?!?: |feat(\(.+\))?!?: |chore(\(.+\))?!?: )?(.*)$/;

const listOfScopeId = Array.from(allowedScope.keys()).join("|");
const allowedScopeRegex = new RegExp(
  `^( *## *scope\\n+)(${listOfScopeId})$`,
  "im"
);

const scopeRegex = /^ *## *scope$/im;

/***
 * Read the pivotal stories (if any) associated with the pr to choose the changelog tag
 * @param prTitle
 */
const getPrTag = async (prTitle: string): Promise<Option<string>> => {
  // detect stories id from the pr title and load the story from pivotal
  const storyIDs = getPivotalStoryIDs(prTitle);
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

  // If a tag can be associated to a story, update the pr title
  return Promise.resolve(fromNullable(storyTag.get(storyType)));
};

/**
 * Clean the title from previous changelog prefix to update in case of changes
 * @param title
 */
const getRawTitle = (title: string): string => {
  // clean the title from existing tags (multiple commit on the same branch)
  const rawTitle = title.match(cleanChangelogRegex)!.pop();
  return rawTitle !== undefined ? rawTitle : danger.github.pr.title;
};

/**
 * Return the scope of the pr, extracted from the '# Scope' section of the pr body
 * @param prBody
 */
const getPrScope = (prBody: string): Option<string> => {
  if (prBody.match(scopeRegex) == null) {
    warn(
      "Section '## Scope' not found in the pull request body. " +
        "This pr will not include a scope in the changelog. " +
        "If your pr doesn't have a scope, please add the section with the value 'general'"
    );
    return none;
  }
  const matchScopeType = prBody.match(allowedScopeRegex);

  if (matchScopeType == null || matchScopeType.length < 3) {
    warn(
      "The value used for the section '## Scope' is not valid! Please use one of the following values:\n" +
        listOfScopeId
    );
    return none;
  }
  return fromNullable(allowedScope.get(matchScopeType[2]));
};

/**
 * Append the changelog tag to the pull request title
 */
const updatePrTitleForChangelog = async () => {
  const maybePrTag = await getPrTag(danger.github.pr.title);
  const rawTitle = getRawTitle(danger.github.pr.title);
  console.log("Scope" + getPrScope(danger.github.pr.body));

  maybePrTag.map(tag =>
    danger.github.api.pulls.update({
      owner: danger.github.thisPR.owner,
      repo: danger.github.thisPR.repo,
      pull_number: danger.github.thisPR.number,
      title: `${tag}${rawTitle}`
    })
  );
};

checkDangers();
updatePrTitleForChangelog()
  .then()
  .catch();
