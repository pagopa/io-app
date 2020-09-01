// Import custom DangerJS rules.
import { warn } from "danger";
// See http://danger.systems/js
// See https://github.com/teamdigitale/danger-plugin-digitalcitizenship/
import checkDangers from "danger-plugin-digitalcitizenship";
import { DangerDSLType } from "danger/distribution/dsl/DangerDSL";
import { none } from "fp-ts/lib/Option";
import {
  allStoriesSameType,
  getChangelogPrefixByStories,
  getChangelogScope,
  getPivotalStoriesFromPrTitle,
  getRawTitle
} from "./scripts/changelog/ts/changelog";

  ["feature", "feat: "],
  ["bug", "fix: "],
  ["chore", "chore: "]
]);

const storyOrder = new Map<StoryType, number>([
  ["feature", 2],
  ["bug", 1],

const multipleTypesWarning =
  "Multiple stories with different types are associated with this Pull request.\n" +
  "Only one tag will be added, following the order: `feature > bug > chore`";

/**
 * Append the changelog tag and scope to the pull request title
 */
const updatePrTitleForChangelog = async () => {
  const associatedStories = await getPivotalStoriesFromPrTitle(
    danger.github.pr.title
  );

  if (!allStoriesSameType(associatedStories)) {
    warn(multipleTypesWarning);
  }
  const maybePrTag = getChangelogPrefixByStories(associatedStories);
  const eitherScope = getChangelogScope(associatedStories);

  if (eitherScope.isLeft()) {
    eitherScope.value.map(err => warn(err.message));
  }
  const scope = eitherScope
    .getOrElse(none)
    .map(s => `(${s})`)
    .getOrElse("");

  }, undefined);

  // clean the title from existing tags (multiple commit on the same branch)
  const title = fromNullable(danger.github.pr.title.match(cleanChangelogRegex))
    .map(matches => matches.pop() || danger.github.pr.title)
    .getOrElse(danger.github.pr.title);

  // If a tag can be associated to a story, update the pr title

  maybePrTag.map(tag =>
    danger.github.api.pulls.update({
      owner: danger.github.thisPR.owner,
      repo: danger.github.thisPR.repo,
      pull_number: danger.github.thisPR.number,
      title: `${tag}${scope}: ${rawTitle}`
    })
  );
};

checkDangers();
void updatePrTitleForChangelog().then().catch();
