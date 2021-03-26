import {
  getPivotalStories,
  getPivotalStoryIDs
} from "danger-plugin-digitalcitizenship/dist/utils";
import { Either, left, right } from "fp-ts/lib/Either";
import { fromNullable, Option } from "fp-ts/lib/Option";
import { Errors } from "io-ts";
import { getJiraTickets } from "../../common/ticket/jira";
import {
  fromJiraToGenericTicket,
  fromPivotalToGenericTicket,
  GenericTicket
} from "../../common/ticket/types";

const jiraRegex = /\[([A-Z0-9]+-\d+(,[A-Z0-9]+-\d+)*)]\s.+/;

export type GenericTicketRetrievalResults = ReadonlyArray<
  Either<Error | Errors, GenericTicket>
>;

/**
 * Extracts Jira ticket ids from the pr title (if any)
 * @param title
 */
export const getJiraIdFromPrTitle = (
  title: string
): Option<ReadonlyArray<string>> =>
  fromNullable(title.match(jiraRegex)).map(a => a[1].split(","));

/**
 * Try to retrieve Jira tickets (or Pivotal stories as fallback) from pr title
 * and transforms them into {@link GenericTicket}
 * ⚠️ Mixed Jira and Pivotal id in the pr title are not supported ⚠️
 * @param title
 */
export const getTicketsFromTitle = async (
  title: string
): Promise<GenericTicketRetrievalResults> => {
  const maybeJiraId = await getJiraIdFromPrTitle(title)
    .map(getJiraTickets)
    .toUndefined();

  if (maybeJiraId) {
    return maybeJiraId.map(x => x.map(fromJiraToGenericTicket));
  }

  const maybePivotalId = await getPivotalStories(getPivotalStoryIDs(title));
  return maybePivotalId
    ? maybePivotalId
        .filter(s => s.story_type !== undefined)
        .map<GenericTicket>(fromPivotalToGenericTicket)
        .map(x => right(x))
    : [left(new Error("No Pivotal stories found"))];
};
