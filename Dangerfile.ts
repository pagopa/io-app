// Import custom DangerJS rules.
import { warn } from "danger";
// See http://danger.systems/js
// See https://github.com/teamdigitale/danger-plugin-digitalcitizenship/
import checkDangers from "danger-plugin-digitalcitizenship";
import { DangerDSLType } from "danger/distribution/dsl/DangerDSL";
import {fromNullable, none} from "fp-ts/lib/Option";
import {
  allStoriesSameType,
  getChangelogPrefixByStories,
  getChangelogScope,
  getPivotalStoriesFromPrTitle
} from "./scripts/changelog/ts/changelog";

declare const danger: DangerDSLType;

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

  const cleanChangelogRegex = /^(fix(\(.+\))?!?: |feat(\(.+\))?!?: |chore(\(.+\))?!?: )?(.*)$/;
  const title = fromNullable(danger.github.pr.title.match(cleanChangelogRegex))
    .map(matches => matches.pop() || danger.github.pr.title)
    .getOrElse(danger.github.pr.title);

  maybePrTag.map(tag =>
    danger.github.api.pulls.update({
      owner: danger.github.thisPR.owner,
      repo: danger.github.thisPR.repo,
      pull_number: danger.github.thisPR.number,
      title: `${tag}${scope}: ${title}`
    })
  );
};

checkDangers();
void updatePrTitleForChangelog()
  .then()
  .catch();
