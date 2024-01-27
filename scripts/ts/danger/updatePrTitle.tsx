import { DangerDSLType } from "danger/distribution/dsl/DangerDSL";
import * as E from "fp-ts/lib/Either";
import { flow, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import {
  JiraTicketRetrievalResults,
  JiraIssueType,
  RemoteJiraTicket
} from "../common/jiraTicket/types";

declare const danger: DangerDSLType;
export declare function warn(message: string): void;

const multipleTypesWarning =
  "Multiple stories with different types are associated with this Pull request.\n" +
  "Only one tag will be added, following the order: `feature > bug > chore`";

const atLeastOneLeftTicket =
  "An error occurred during the retrieval of a ticket," +
  " the title of the pull request is updated taking into account only the recovered tickets ";

const storyTag = new Map<JiraIssueType, string>([
  ["Epic", "feat"],
  ["Story", "feat"],
  ["Bug", "fix"],
  ["Sub-task", "chore"],
  ["Sottotask", "chore"],
  ["Subtask", "chore"],
  ["Task", "chore"]
]);

const storyOrder = new Map<JiraIssueType, number>([
  ["Epic", 3],
  ["Story", 2],
  ["Bug", 1],
  ["Sub-task", 0],
  ["Sottotask", 0],
  ["Subtask", 0],
  ["Task", 0]
]);

// a list of project ids associated with a specific scope
const projectToScope = new Map<string, string>([
  ["IACROSS", "Cross"],
  ["SFEQS", "Firma con IO"],
  ["IODPAY", "IDPay"]
]);

/**
 * Calculate the Changelog prefix for the provided stories.
 * @param stories
 */
export const getChangelogPrefixByStories = (
  stories: ReadonlyArray<RemoteJiraTicket>
): O.Option<string> => {
  // In case of multiple stories, only one tag can be added, following the order feature > bug > chore
  const storyType = stories.reduce<O.Option<JiraIssueType>>((acc, val) => {
    const currentStoryOrder = O.fromNullable(
      storyOrder.get(val.fields.issuetype.name)
    );
    const prevStoryOrder = pipe(
      acc,
      O.chain(v => O.fromNullable(storyOrder.get(v)))
    );

    if (O.isSome(currentStoryOrder) && O.isSome(prevStoryOrder)) {
      return currentStoryOrder.value > prevStoryOrder.value
        ? O.some(val.fields.issuetype.name)
        : acc;
    } else if (O.isSome(currentStoryOrder)) {
      return O.some(val.fields.issuetype.name);
    }
    return acc;
  }, O.none);

  return pipe(
    storyType,
    O.chain(st => O.fromNullable(storyTag.get(st)))
  );
};

/**
 * Append the changelog tag and scope to the pull request title, based on the story found
 */
export const updatePrTitleForChangelog = async (
  tickets: JiraTicketRetrievalResults
) => {
  if (tickets.some(E.isLeft)) {
    warn(atLeastOneLeftTicket);
  }

  const foundTicket = tickets.filter(E.isRight).map(x => x.right);

  if (!allStoriesSameType(foundTicket)) {
    warn(multipleTypesWarning);
  }
  const maybePrTag = getChangelogPrefixByStories(foundTicket);
  const eitherScope = getChangelogScope(foundTicket);

  if (E.isLeft(eitherScope)) {
    eitherScope.left.map(err => warn(err.message));
  }
  const scope = pipe(
    eitherScope,
    E.map(
      flow(
        O.map(s => `(${s})`),
        O.getOrElse(() => "")
      )
    ),
    E.getOrElseW(() => "")
  );

  const cleanChangelogRegex =
    /^(fix(\(.+\))?!?: |feat(\(.+\))?!?: |chore(\(.+\))?!?: )?(.*)$/;
  const title = pipe(
    danger.github.pr.title.match(cleanChangelogRegex),
    O.fromNullable,
    O.map(matches => matches.pop() || danger.github.pr.title),
    O.getOrElse(() => danger.github.pr.title)
  );

  const labelScope = scope.replace("(", "").replace(")", "");
  await danger.github.utils.createOrAddLabel({
    name: labelScope,
    // The color is not used and can be customized from the "label" tab in the github page
    color: "#FFFFFF",
    description: labelScope
  });

  // Ensure the first char after the ticket id is uppercase
  // [JIRA-12] pr title -> [JIRA-12] Pr title
  const titleSplitter = new RegExp(/(\[.*]\s*)(.+)/g);
  const splittingResults = titleSplitter.exec(title);
  const upperCaseTitle =
    splittingResults && splittingResults.length === 3
      ? `${splittingResults[1]}${
          splittingResults[2].charAt(0).toUpperCase() +
          splittingResults[2].slice(1)
        }`
      : title;

  O.map(tag =>
    danger.github.api.pulls.update({
      owner: danger.github.thisPR.owner,
      repo: danger.github.thisPR.repo,
      pull_number: danger.github.thisPR.number,
      title: `${tag}${scope}: ${upperCaseTitle}`
    })
  )(maybePrTag);
};

/**
 * Return true if all the stories have the same `story_type`
 * @param stories
 */
export const allStoriesSameType = (
  stories: ReadonlyArray<RemoteJiraTicket>
): boolean =>
  stories.every(
    (val, _, arr) => val.fields.issuetype === arr[0].fields.issuetype
  );

/**
 * Calculate the changelog scope for the story
 * Return:
 * - O.None if the story doesn't belong to a scope project
 * - O.Some<string>>` if the story belongs to a scope project
 * @param story
 */
export const getTicketChangelogScope = (
  story: RemoteJiraTicket
): O.Option<string> =>
  O.fromNullable(projectToScope.get(story.fields.project.key));

/**
 * Calculate the Changelog scope for the stories.
 * Return:
 * - `Right<none>` if no scope is found
 * - `Right<Some<string>>` if one of the stories have a scope or all the stories that have scope have the same scope
 * - `Left<ReadonlyArray<Error>>` if two stories have different scope or one of the story have different scope
 * @param stories
 */

export const getChangelogScope = (
  stories: ReadonlyArray<RemoteJiraTicket>
): E.Either<ReadonlyArray<Error>, O.Option<string>> => {
  const eitherChangelogScopes = stories.map(getTicketChangelogScope);

  const scopesList = eitherChangelogScopes
    .filter((maybeScope): maybeScope is O.Some<string> => O.isSome(maybeScope))
    .map(scope => scope.value);

  if (scopesList.length === 0) {
    return E.right(O.none);
  }

  return scopesList.every((scope, _, arr) => scope === arr[0])
    ? E.right(O.some(scopesList[0]))
    : E.left([
        new Error(
          `Different scopes were found on the stories related to the pull request: [${scopesList.join(
            ","
          )}].\n
           It is not possible to assign a single scope to this pull request!`
        )
      ]);
};
