import {
  getPivotalStories,
  getPivotalStoryIDs
} from "danger-plugin-digitalcitizenship/dist/utils";
import { Either, left, right } from "fp-ts/lib/Either";
import { fromNullable, Option } from "fp-ts/lib/Option";
import { Errors } from "io-ts";
import { getJiraTickets } from "./jira";
import { JiraKey } from "./jira/types";
import { PivotalId } from "./pivotal/types";
import {
  fromJiraToGenericTicket,
  fromPivotalToGenericTicket,
  GenericTicket
} from "./types";

const pivotalRegex = /\[(#\d+(,#\d+)*)]\s.+/;
const jiraRegex = /\[([a-zA-Z]+-\d+(,[a-zA-Z]+-\d+)*)]\s.+/;

/**
 * From a PR title extract the Pivotal IDs or Jira IDs (if any).
 * The title can have multiple IDs but they must all be of the same type
 * @param title
 */
export const parsePrTitle = (
  title: string
): Option<ReadonlyArray<JiraKey> | ReadonlyArray<PivotalId>> => {
  const maybePivotal = fromNullable(title.match(pivotalRegex)?.pop()).map(
    p => p.replace("#", "").split(",") as Array<PivotalId>
  );
  const maybeJira = fromNullable(title.match(jiraRegex)?.pop()).map(
    j => j.split(",") as Array<JiraKey>
  );

  return maybePivotal.isNone() ? maybeJira : maybePivotal;
};

export const prTitleContainsJiraIds = (title: string) =>
  title.match(jiraRegex) !== null;

export const getJiraIdFromPrTitle = (
  title: string
): Option<ReadonlyArray<string>> =>
  fromNullable(title.match(jiraRegex)).map(a => a[1].split(","));

export const getTicketsFromTitle = async (
  title: string
): Promise<ReadonlyArray<Either<Error | Errors, GenericTicket>>> => {
  const maybeJiraId = (
    await getJiraIdFromPrTitle(title).map(getJiraTickets).toUndefined()
  )?.map(x => x.map(fromJiraToGenericTicket));

  if (maybeJiraId) {
    return maybeJiraId;
  }

  const maybePivotalId =
    (await getPivotalStories(getPivotalStoryIDs(title)))
      ?.filter(s => s.story_type !== undefined)
      .map<GenericTicket>(fromPivotalToGenericTicket) ?? [];
  return maybePivotalId
    ? maybePivotalId.map(x => right(x))
    : [left(new Error("No Pivotal stories found"))];
};
