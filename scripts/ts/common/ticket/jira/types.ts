import * as t from "io-ts";

const JiraIssueType = t.keyof({
  Epic: null,
  Story: null,
  Task: null,
  Sottotask: null,
  "Sub-task": null,
  Subtask: null,
  Bug: null
});

export type JiraIssueType = t.TypeOf<typeof JiraIssueType>;

const IssueType = t.interface({
  name: JiraIssueType,
  subtask: t.boolean
});

const Project = t.interface({
  id: t.string,
  key: t.string,
  name: t.string
});

const FieldsR = t.interface({
  issuetype: IssueType,
  project: Project,
  labels: t.array(t.string),
  summary: t.string
});

const FieldsP = t.partial({
  parent: t.interface({
    key: t.string,
    fields: t.interface({
      summary: t.string,
      issuetype: IssueType
    })
  })
});

const Fields = t.intersection([FieldsR, FieldsP], "Fields");

/**
 * The required fields from the remote response.
 * Not all the fields are used, see https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-get
 * for more information
 */
export const RemoteJiraTicket = t.interface({
  key: t.string,
  fields: Fields
});

export type RemoteJiraTicket = t.TypeOf<typeof RemoteJiraTicket>;
