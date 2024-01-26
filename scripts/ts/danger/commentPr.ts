import { DangerDSLType } from "danger/distribution/dsl/DangerDSL";
import * as E from "fp-ts/lib/Either";
import { Errors } from "io-ts";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import {
  JiraTicketRetrievalResults,
  JiraIssueType,
  RemoteJiraTicket,
  RemoteJiraTicketParent
} from "../common/jiraTicket/types";
import { jiraTicketBaseUrl } from "../common/jiraTicket";

declare const danger: DangerDSLType;

export declare function warn(message: string): void;
export declare function markdown(message: string): void;

const StoryEmoji: Record<JiraIssueType, string> = {
  Epic: "⚡",
  Story: "🌟",
  Task: "⚙️",
  Subtask: "⚙️",
  "Sub-task": "⚙️",
  Sottotask: "⚙️",
  Bug: "🐞"
};

/**
 * Display how should be used the Jira id in the pr title
 */
const warningNoTicket = () => {
  warn("Please include a Jira ticket at the beginning of the PR title");
  markdown(` 
  Example of PR titles that include Jira tickets:
  * single story: \`[PROJID-123] my PR title\`
  * multiple stories: \`[PROJID-1,PROJID-2,PROJID-3] my PR title\`
    `);
};
/**
 * Comments with the ticket type, id and title
 * @param ticket
 */
const renderTicket = (ticket: RemoteJiraTicket | RemoteJiraTicketParent) => {
  const ticketType = StoryEmoji[ticket.fields.issuetype.name];
  const ticketUrl = new URL(ticket.key, jiraTicketBaseUrl).toString();
  return `${ticketType} [${ticket.key}](${ticketUrl}): ${ticket.fields.summary}`;
};

const renderTickets = (ticketList: ReadonlyArray<RemoteJiraTicket>) => {
  const ticketListToString = ticketList
    .map(s => {
      const subtask = s.fields.parent
        ? ` \n _subtask of_\n     * ${renderTicket(s.fields.parent)}`
        : "";
      return `  * ${renderTicket(s)}${subtask}`;
    })
    .join("\n");
  markdown(`
## Affected stories
${ticketListToString}\n`);
};

/**
 * Comments with the failures details obtained during the retrieval
 * @param errors
 */
const renderFailure = (errors: ReadonlyArray<Error | Errors>) => {
  errors.map(e =>
    warn(
      `There was an error retrieving a ticket: ${
        e instanceof Error ? e.message : readableReport(e)
      }`
    )
  );
};

/**
 * Uses foundTicket to create a pr comment with the related information
 * @param foundTicket
 */
export const commentPrWithTicketsInfo = (
  foundTicket: JiraTicketRetrievalResults
) => {
  if (foundTicket.length === 0) {
    warningNoTicket();
    return;
  }
  if (foundTicket.some(E.isLeft)) {
    renderFailure(foundTicket.filter(E.isLeft).map(x => x.left));
  }
  if (foundTicket.some(E.isRight)) {
    renderTickets(foundTicket.filter(E.isRight).map(x => x.right));
  }
};
