import { jiraTicketBaseUrl } from "./jira";
import { JiraIssueType, RemoteJiraTicket } from "./jira/types";
import { PivotalStory, PivotalStoryType } from "./pivotal/types";

export type GenericTicketType = "feat" | "fix" | "chore";

export type GenericTicket = {
  id: string;
  idPrefix?: string;
  title: string;
  type: GenericTicketType;
  projectId: string;
  tags: ReadonlyArray<string>;
  url: string;
};

const convertJiraTypeToGeneric = (
  jiraType: JiraIssueType
): GenericTicketType => {
  switch (jiraType) {
    case "Bug":
      return "fix";
    case "Epic":
      return "feat";
    case "Sottotask":
      return "chore";
    case "Story":
      return "feat";
    case "Task":
      return "chore";
  }
};

const getTypeFromJira = (jira: RemoteJiraTicket) => {
  // if this is a subtask with a parent, the type is the type of the parent
  if (jira.fields.parent !== undefined && jira.fields.issuetype.subtask) {
    return convertJiraTypeToGeneric(jira.fields.parent.fields.issuetype.name);
  }
  return convertJiraTypeToGeneric(jira.fields.issuetype.name);
};

export const fromJiraToGenericTicket = (
  jira: RemoteJiraTicket
): GenericTicket => ({
  id: jira.key,
  title: jira.fields.summary,
  type: getTypeFromJira(jira),
  projectId: jira.fields.project.key,
  tags: jira.fields.labels,
  url: new URL(jira.key, jiraTicketBaseUrl).toString()
});

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
