import { DangerDSLType } from "danger/distribution/dsl/DangerDSL";
import { isLeft, isRight } from "fp-ts/lib/Either";
import { fromNullable, none } from "fp-ts/lib/Option";
import {
  allStoriesSameType,
  getChangelogPrefixByStories,
  getChangelogScope
} from "./utils/changelog";
import { GenericTicketRetrievalResults } from "./utils/titleParser";

declare const danger: DangerDSLType;
export declare function warn(message: string): void;

const multipleTypesWarning =
  "Multiple stories with different types are associated with this Pull request.\n" +
  "Only one tag will be added, following the order: `feature > bug > chore`";

const atLeastOneLeftTicket =
  "An error occurred in the recovery of a ticket," +
  " the title of the pull request is updated taking into account only the recovered tickets ";

/**
 * Append the changelog tag and scope to the pull request title, based on the story found
 */
export const updatePrTitleForChangelog = async (
  tickets: GenericTicketRetrievalResults
) => {
  if (tickets.some(isLeft)) {
    warn(atLeastOneLeftTicket);
  }

  const foundTicket = tickets.filter(isRight).map(x => x.value);

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

  await danger.github.utils.createOrAddLabel({
    name: scope,
    color: "#000FFF",
    description: scope
  });

  maybePrTag.map(tag =>
    danger.github.api.pulls.update({
      owner: danger.github.thisPR.owner,
      repo: danger.github.thisPR.repo,
      pull_number: danger.github.thisPR.number,
      title: `${tag}${scope}: ${title.charAt(0).toUpperCase() + title.slice(1)}`
    })
  );
};
