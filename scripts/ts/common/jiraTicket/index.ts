import * as E from "fp-ts/lib/Either";
import { flow, pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { Errors } from "io-ts";
import fetch from "node-fetch";
import * as O from "fp-ts/lib/Option";
import { JiraTicketRetrievalResults, RemoteJiraTicket } from "./types";

const jiraOrgBaseUrl = "https://pagopa.atlassian.net/rest/api/3/issue/";
export const jiraTicketBaseUrl = "https://pagopa.atlassian.net/browse/";
const username = process.env.JIRA_USERNAME;
const password = process.env.JIRA_PASSWORD;

/**
 * Networking code to retrieve the remote representation for the JiraTicket
 * @param id
 */
const retrieveRawJiraTicket = async (id: string): Promise<unknown> => {
  const url = new URL(id, jiraOrgBaseUrl);
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization:
        "Basic " + Buffer.from(`${username}:${password}`).toString("base64")
    }
  });
  if (res.status !== 200) {
    throw new Error(
      `Response status ${res.status} ${res.statusText} for ${id}`
    );
  }
  return await res.json();
};

const retrieveRawJiraTicketTask = (id: string): TE.TaskEither<Error, unknown> =>
  TE.tryCatch(() => retrieveRawJiraTicket(id), E.toError);

/**
 * Ensure that the remote payload has the required fields
 * @param payload
 */
const decodeRemoteJiraTicket = (
  payload: any
): E.Either<Errors, RemoteJiraTicket> => RemoteJiraTicket.decode(payload);

const getJiraTicket = async (
  jiraId: string
): Promise<E.Either<Errors | Error, RemoteJiraTicket>> =>
  pipe(
    retrieveRawJiraTicketTask(jiraId),
    TE.chainW(flow(decodeRemoteJiraTicket, TE.fromEither))
  )();

/**
 * Retrieve {@link RemoteJiraTicket} using jiraIds as input
 * @param jiraIds
 */
export const getJiraTickets = async (
  jiraIds: ReadonlyArray<string>
): Promise<ReadonlyArray<E.Either<Errors | Error, RemoteJiraTicket>>> =>
  await Promise.all(jiraIds.map(getJiraTicket));

const jiraRegex = /\[([A-Z0-9]+-\d+(,[A-Z0-9]+-\d+)*)]\s.+/;

/**
 * Extracts Jira ticket ids from the pr title (if any)
 * @param title
 */
export const getJiraIdFromPrTitle = (
  title: string
): O.Option<ReadonlyArray<string>> =>
  pipe(
    title.match(jiraRegex),
    O.fromNullable,
    O.map(a => a[1].split(","))
  );

/**
 * Try to retrieve Jira tickets from pr title
 * and transforms them into {@link GenericTicket}
 * @param title
 * @returns a promise of {@link JiraTicketRetrievalResults} containing the jira tickets or an error. If no tickets are found, an empty array is returned
 */
export const getTicketsFromTitle = async (
  title: string
): Promise<JiraTicketRetrievalResults> =>
  pipe(
    title,
    getJiraIdFromPrTitle,
    O.fold(
      () => Promise.resolve([]),
      jiraIds => getJiraTickets(jiraIds)
    )
  );
