import { RemoteJiraTicket } from "../../common/jiraTicket/types";

export const getJiraTicketExample = (
  issueType: RemoteJiraTicket["fields"]["issuetype"]["name"],
  projectKey: RemoteJiraTicket["fields"]["project"]["key"] = "IO"
): RemoteJiraTicket => ({
  key: "IO-123",
  fields: {
    issuetype: {
      name: issueType,
      subtask: false
    },
    project: {
      id: "123",
      key: projectKey,
      name: "IO"
    },
    labels: [],
    summary: "Test"
  }
});
