import { DangerDSLType } from "danger/distribution/dsl/DangerDSL";
import { isRight } from "fp-ts/lib/Either";
import { fromNullable, none } from "fp-ts/lib/Option";
import {
  allStoriesSameType,
  getChangelogPrefixByStories,
  getChangelogScope
} from "./utils/changelog";
import { getTicketsFromTitle } from "./utils/titleParser";

declare const danger: DangerDSLType;
export declare function warn(message: string): void;

const multipleTypesWarning =
  "Multiple stories with different types are associated with this Pull request.\n" +
  "Only one tag will be added, following the order: `feature > bug > chore`";

/**
 * Append the changelog tag and scope to the pull request title
 */
export const updatePrTitleForChangelog = async () => {
  const associatedStories = await getTicketsFromTitle(danger.github.pr.title);

  const foundTicket = associatedStories.filter(isRight).map(x => x.value);

  if (!allStoriesSameType(foundTicket)) {
    warn(multipleTypesWarning);
  }
  const maybePrTag = getChangelogPrefixByStories(foundTicket);
  const eitherScope = getChangelogScope(foundTicket);

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
