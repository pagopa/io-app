import { toError } from "fp-ts/lib/Either";
import { tryCatch } from "fp-ts/lib/TaskEither";
import { Errors } from "io-ts";
import fetch from "node-fetch";
import { RemoteJiraTicket } from "./types";

const jiraOrgBaseUrl = "https://pagopa.atlassian.net/rest/api/3/issue/";
const username = process.env.JIRA_USERNAME;
const password = process.env.JIRA_PASSWORD;

/**
 * Http code to retrieve the remote representation for the JiraTicket
 * @param id
 */
const retrieveRawJiraTicket = async (id: string) => {
  const url = new URL(id, jiraOrgBaseUrl);
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization:
        "Basic " + Buffer.from(`${username}:${password}`).toString("base64")
    }
  });
  if (res.status !== 200) {
    throw new Error(`Response status ${res.status} ${res.statusText}`);
  }
  return await res.json();
};

const retrieveRawJiraTicketTask = (id: string) =>
  tryCatch(() => retrieveRawJiraTicket(id), toError);

/**
 * Ensure that the remote payload have the required fields
 * @param payload
 */
const decodeRemoteJiraTicket = (payload: any) =>
  RemoteJiraTicket.decode(payload);

const getJiraTicket = async (jiraId: string) =>
  (
    await retrieveRawJiraTicketTask(jiraId)
      .mapLeft<Errors | Error>(e => e)
      .run()
  ).chain(decodeRemoteJiraTicket);

export const getJiraTickets = async (jiraIds: ReadonlyArray<string>) =>
  await Promise.all(jiraIds.map(getJiraTicket));
