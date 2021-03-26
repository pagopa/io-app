import { Either, toError } from "fp-ts/lib/Either";
import { TaskEither, tryCatch } from "fp-ts/lib/TaskEither";
import { Errors } from "io-ts";
import fetch from "node-fetch";
import { RemoteJiraTicket } from "./types";

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

const retrieveRawJiraTicketTask = (id: string): TaskEither<Error, unknown> =>
  tryCatch(() => retrieveRawJiraTicket(id), toError);

/**
 * Ensure that the remote payload have the required fields
 * @param payload
 */
const decodeRemoteJiraTicket = (
  payload: any
): Either<Errors, RemoteJiraTicket> => RemoteJiraTicket.decode(payload);

const getJiraTicket = async (
  jiraId: string
): Promise<Either<Errors | Error, RemoteJiraTicket>> =>
  (
    await retrieveRawJiraTicketTask(jiraId)
      .mapLeft<Errors | Error>(e => e)
      .run()
  ).chain(decodeRemoteJiraTicket);

/**
 * Retrieve {@link RemoteJiraTicket} using jiraIds as input
 * @param jiraIds
 */
export const getJiraTickets = async (
  jiraIds: ReadonlyArray<string>
): Promise<ReadonlyArray<Either<Errors | Error, RemoteJiraTicket>>> =>
  await Promise.all(jiraIds.map(getJiraTicket));
