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
  getPivotalStoriesFromPrTitle
} from "./scripts/changelog/ts/pivotalUtility";

declare var danger: DangerDSLType;

const allowedScope = new Map<string, string>([
  ["general", ""],
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

/**
 * Clean the title from previous changelog prefix to update in case of changes
 * @param title
 */
const getRawTitle = (title: string): string => {
  // clean the title from existing tags (multiple commit on the same branch)
  const rawTitle = title.match(cleanChangelogRegex)!.pop();
  return rawTitle !== undefined ? rawTitle : danger.github.pr.title;
};

const multipleTypesWarning =
  "Multiple stories with different types are associated with this Pull request.\n" +
  "Only one tag will be added, following the order: `feature > bug > chore`";

/**
 * Append the changelog tag to the pull request title
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
  const maybeScope = eitherScope.getOrElse(none).map(scope => `(${scope})`);
  const totalTag = maybePrTag
    .map(tag => maybeScope.map(scope => `${tag}${scope}`))
    .map(totaltag => `${totaltag}: `);
  console.log(totalTag);

  const rawTitle = getRawTitle(danger.github.pr.title);

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
