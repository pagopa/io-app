import { JiraTicketType, RemoteJiraTicket } from "./jira/types";

export type GenericTicketType = "feat" | "fix" | "chore";

export type GenericTicket = {
  id: string;
  title: string;
  type: GenericTicketType;
  projectId: string;
  tags: ReadonlyArray<string>;
};

const convertJiraTypeToGeneric = (
  jiraType: JiraTicketType
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
  tags: jira.fields.labels
});
