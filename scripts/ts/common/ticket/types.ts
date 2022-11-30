import { jiraTicketBaseUrl } from "./jira";
import { JiraIssueType, RemoteJiraTicket } from "./jira/types";
import { PivotalStory, PivotalStoryType } from "./pivotal/types";

export type GenericTicketType = "feat" | "fix" | "chore" | "epic";

/**
 * A generic representation of a ticket, platform independent
 */
export type GenericTicket = {
  id: string;
  // a prefix that should be used to represent the ticket id
  idPrefix?: string;
  title: string;
  type: GenericTicketType;
  projectId: string;
  tags: ReadonlyArray<string>;
  // the url to reach the ticket
  url: string;
  // is a subtask linked with a father ticket?
  parent?: GenericTicket;
};

/**
 * From {@link JiraIssueType} to {@link GenericTicketType}
 * @param jiraType
 */
const convertJiraTypeToGeneric = (
  jiraType: JiraIssueType
): GenericTicketType => {
  switch (jiraType) {
    case "Bug":
      return "fix";
    case "Epic":
      return "epic";
    case "Sub-task":
    case "Sottotask":
    case "Subtask":
      return "chore";
    case "Story":
      return "feat";
    case "Task":
      return "chore";
  }
};

/**
 * Extracts the Jira ticket type. If is a subtask, use the father ticket for the type
 * @param jira
 */
const getTypeFromJira = (jira: RemoteJiraTicket) => {
  // if this is a subtask with a parent, the type is the type of the parent
  if (jira.fields.parent !== undefined && jira.fields.issuetype.subtask) {
    return convertJiraTypeToGeneric(jira.fields.parent.fields.issuetype.name);
  }
  return convertJiraTypeToGeneric(jira.fields.issuetype.name);
};

/**
 * From {@link RemoteJiraTicket} to {@link GenericTicket}
 * @param jira
 */
export const fromJiraToGenericTicket = (
  jira: RemoteJiraTicket
): GenericTicket => ({
  id: jira.key,
  title: jira.fields.summary,
  type: getTypeFromJira(jira),
  projectId: jira.fields.project.key,
  tags: jira.fields.labels,
  url: new URL(jira.key, jiraTicketBaseUrl).toString(),
  parent: jira.fields.parent
    ? fromJiraToGenericTicket({
        ...jira.fields.parent,
        fields: {
          ...jira.fields.parent.fields,
          project: jira.fields.project,
          labels: []
        }
      })
    : undefined
});

/**
 * From {@link PivotalStoryType} to {@link GenericTicketType}
 * @param pivotalType
 */
const convertPivotalTypeToGeneric = (
  pivotalType: PivotalStoryType
): GenericTicketType => {
  switch (pivotalType) {
    case "bug":
      return "fix";
    case "feature":
      return "feat";
    case "chore":
      return "chore";
    case "release":
      return "feat";
  }
};

/**
 * From {@link PivotalStory} to {@link GenericTicket}
 * @param pivotalStory
 */
export const fromPivotalToGenericTicket = (
  pivotalStory: PivotalStory
): GenericTicket => ({
  id: pivotalStory.id,
  idPrefix: "#",
  title: pivotalStory.name,
  type: convertPivotalTypeToGeneric(pivotalStory.story_type),
  projectId: pivotalStory.project_id.toString(),
  tags: pivotalStory.labels.map(x => x.name),
  url: pivotalStory.url
});
