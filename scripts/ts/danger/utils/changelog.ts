/* eslint-disable @typescript-eslint/no-non-null-assertion */
// The script need to be executed by the danger bot that doesn't support the optional chaining operator
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { GenericTicket, GenericTicketType } from "../../common/ticket/types";

const storyTag = new Map<GenericTicketType, string>([
  ["feat", "feat"],
  ["fix", "fix"],
  ["chore", "chore"],
  ["epic", "feat"]
]);

const storyOrder = new Map<GenericTicketType, number>([
  ["epic", 3],
  ["feat", 2],
  ["fix", 1],
  ["chore", 0]
]);

const allowedScope = new Map<string, string>([
  ["android", "Android"],
  ["ios", "iOS"],
  ["bonus_vacanze", "Bonus Vacanze"],
  ["messages", "Messages"],
  ["payments", "Payments"],
  ["services", "Services"],
  ["profile", "Profile"],
  ["privacy", "Privacy"],
  ["security", "Security"],
  ["accessibility", "Accessibility"],
  ["bpd", "Bonus Pagamenti Digitali"],
  ["cgn", "Carta Giovani Nazionale"],
  ["fims", "Federated Identity Management System"],
  ["myportal", "MyPortal"]
]);

// a list of project ids associated with a specific scope
const projectToScope = new Map<string, string>([
  ["2449547", "Bonus Vacanze"],
  ["2463683", "My Portal"],
  ["2477137", "Bonus Pagamenti Digitali"],
  ["IAC", "Bonus Pagamenti Digitali"],
  ["IOACGN", "Carta Giovani Nazionale"],
  ["IASV", "Sicilia Vola"],
  ["IAGP", "EU Covid Certificate"],
  ["IARS", "Redesign Servizi"],
  ["ASZ", "Zendesk"],
  ["IAMVL", "Piattaforma Notifiche"],
  ["IAFIMS", "Federated Identity Management System"],
  ["AP", "Carta della cultura"],
  ["SFEQS", "Firma con IO"],
  ["IODPAY", "IDPay"],
  ["SIW", "IT Wallet"]
]);

const cleanChangelogRegex =
  /^(fix(\(.+\))?!?: |feat(\(.+\))?!?: |chore(\(.+\))?!?: )?(.*)$/;

// pattern used to recognize a scope label
const regex = /(changelog-scope:|epic-)(.*)/m;

/**
 * Clean the title from previous changelog prefix to update in case of changes
 * @param title
 */
export const getRawTitle = (title: string): string => {
  // clean the title from existing tags (multiple commit on the same branch)
  const rawTitle = title.match(cleanChangelogRegex)!.pop();
  return rawTitle !== undefined ? rawTitle : title;
};

/**
 * Return true if all the stories have the same `story_type`
 * @param stories
 */
export const allStoriesSameType = (
  stories: ReadonlyArray<GenericTicket>
): boolean => stories.every((val, _, arr) => val.type === arr[0].type);

/**
 * Calculate the Changelog prefix for the provided stories.
 * @param stories
 */
export const getChangelogPrefixByStories = (
  stories: ReadonlyArray<GenericTicket>
): O.Option<string> => {
  // In case of multiple stories, only one tag can be added, following the order feature > bug > chore
  const storyType = stories.reduce<O.Option<GenericTicketType>>((acc, val) => {
    const currentStoryOrder = O.fromNullable(storyOrder.get(val.type));
    const prevStoryOrder = pipe(
      acc,
      O.chain(v => O.fromNullable(storyOrder.get(v)))
    );

    if (O.isSome(currentStoryOrder) && O.isSome(prevStoryOrder)) {
      return currentStoryOrder.value > prevStoryOrder.value
        ? O.some(val.type)
        : acc;
    } else if (O.isSome(currentStoryOrder)) {
      return O.some(val.type);
    }
    return acc;
  }, O.none);

  return pipe(
    storyType,
    O.chain(st => O.fromNullable(storyTag.get(st)))
  );
};

/**
 * Calculate the changelog scope for the story
 * Return:
 * - `Right<none>` if no labels with scope are associated with the story and the story doesn't belong to a scope project.
 * - `Right<Some<string>>` if the story have a scope label or the story belong to a scope project
 * - `Left<Error>` if the story have multiple different scope label or the story have a scope label and belong to a scope project.
 * @param story
 */
export const getStoryChangelogScope = (
  story: GenericTicket
): E.Either<Error, O.Option<string>> => {
  // try to retrieve the project scope (if any)
  const maybeProjectScope = O.fromNullable(projectToScope.get(story.projectId));
  // search for scope labels associated with the story
  const maybeChangelogScopeTag = story.tags
    .filter(l => l.match(regex))
    .map(l => l.match(regex)!.pop())
    .filter(tag => tag && allowedScope.has(tag));

  // multiple scope labels found on the story
  if (maybeChangelogScopeTag.length > 1) {
    return E.left(
      new Error(
        `Multiple labels match the expression \`${regex}\` for the story [#${story.id}].\n
       It is not possible to assign a single scope to this pull request!`
      )
    );
  }
  // the story matches a project scope and also have scope label
  if (O.isSome(maybeProjectScope) && maybeChangelogScopeTag.length >= 1) {
    return E.left(
      new Error(
        `The story [#${story.id}] have the project_id ${story.projectId} associated with the scope ${maybeProjectScope.value} but also have labels matching the expression \`${regex}\`.\n
        It is not possible to assign a single scope to this pull request!`
      )
    );
  }
  if (O.isSome(maybeProjectScope)) {
    return E.right(maybeProjectScope);
  }
  if (
    maybeChangelogScopeTag.length === 1 &&
    maybeChangelogScopeTag[0] !== undefined
  ) {
    // check if is allowed
    const scopeDisplayName = allowedScope.get(maybeChangelogScopeTag[0]);
    return scopeDisplayName !== undefined
      ? E.right(O.some(scopeDisplayName))
      : E.left(
          new Error(
            `The scope ${
              maybeChangelogScopeTag[0]
            } is not present in the allowed scopes: ${Array.from(
              allowedScope.keys()
            ).join(",")}`
          )
        );
  }
  // neither project scope nor scope label found
  return E.right(O.none);
};

/**
 * Calculate the Changelog scope for the stories.
 * Return:
 * - `Right<none>` if no scope is found
 * - `Right<Some<string>>` if one of the stories have a scope or all the stories that have scope have the same scope
 * - `Left<ReadonlyArray<Error>>` if two stories have different scope or one of the story have different scope
 * @param stories
 */
export const getChangelogScope = (
  stories: ReadonlyArray<GenericTicket>
): E.Either<ReadonlyArray<Error>, O.Option<string>> => {
  const eitherChangelogScopes = stories.map(getStoryChangelogScope);

  // if there is some error, forward the errors
  if (eitherChangelogScopes.some(E.isLeft)) {
    return E.left(
      eitherChangelogScopes.reduce<ReadonlyArray<Error>>(
        (acc, val) => (E.isLeft(val) ? [...acc, val.left] : acc),
        []
      )
    );
  }
  const scopesList = eitherChangelogScopes
    .filter(
      (maybeScope): maybeScope is E.Right<O.Some<string>> =>
        E.isRight(maybeScope) && O.isSome(maybeScope.right)
    )
    .map(scope => scope.right.value);

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
