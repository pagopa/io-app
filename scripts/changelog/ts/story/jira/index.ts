import { toError } from "fp-ts/lib/Either";
import { tryCatch } from "fp-ts/lib/TaskEither";
import { Errors } from "io-ts";
import fetch from "node-fetch";
import { JiraKey, JiraTicket, RemoteJiraTicket } from "./types";

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

/**
 * Transform from remote datamodel {@link RemoteJiraTicket} to local datamodel {@link JiraTicket}
 * @param remote
 */
const convertToJiraTicket = (remote: RemoteJiraTicket): JiraTicket => ({
  key: remote.key as JiraKey,
  type: remote.fields.issuetype.name,
  project: remote.fields.project,
  summary: remote.fields.summary,
  parent:
    remote.fields.issuetype.subtask && remote.fields.parent !== undefined
      ? {
          key: remote.fields.parent.key as JiraKey,
          type: remote.fields.parent.fields.issuetype.name,
          summary: remote.fields.parent.fields.summary,
          project: remote.fields.project
        }
      : undefined
});

export const getJiraTickets = async (_: ReadonlyArray<JiraKey>) =>
  (
    await retrieveRawJiraTicketTask("FABT-4" as JiraKey)
      .mapLeft<Errors | Error>(e => e)
      .run()
  )
    .chain(decodeRemoteJiraTicket)
    .map(convertToJiraTicket);
