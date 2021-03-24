import { toError } from "fp-ts/lib/Either";
import { tryCatch } from "fp-ts/lib/TaskEither";
import { Errors } from "io-ts";
import fetch from "node-fetch";
import { JiraKey, RemoteJiraTicket } from "./types";

const jiraOrgBaseUrl = "https://pagopa.atlassian.net/rest/api/3/issue/";
const username = "";
const password = "";

/**
 * Http code to retrieve the remote representation for the JiraTicket
 * @param id
 */
const retrieveRawJiraTicket = async (id: JiraKey) => {
  const url = new URL(id, jiraOrgBaseUrl);
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization:
        "Basic " + Buffer.from(username + ":" + password).toString("base64")
    }
  });
  if (res.status !== 200) {
    throw new Error(`Response status ${res.status} ${res.statusText}`);
  }
  return await res.json();
};

const retrieveRawJiraTicketTask = (id: JiraKey) =>
  tryCatch(() => retrieveRawJiraTicket(id), toError);

/**
 * Ensure that the remote payload have the required fields
 * @param payload
 */
const decodeRemoteJiraTicket = (payload: any) =>
  RemoteJiraTicket.decode(payload);

export const getJiraTickets = async (_: ReadonlyArray<JiraKey>) =>
  (
    await retrieveRawJiraTicketTask("FABT-4" as JiraKey)
      .mapLeft<Errors | Error>(e => e)
      .run()
  ).chain(decodeRemoteJiraTicket);
