import * as t from "io-ts";
import { IUnitTag } from "italia-ts-commons/lib/units";

export type JiraKey = string & IUnitTag<"JiraKey">;

export type JiraTicketType = "Epic" | "Story" | "Task" | "Sottotask" | "Bug";

export type JiraProjectId = string & IUnitTag<"JiraProjectId">;

export type JiraProject = {
  id: string;
  name: string;
  key: string;
};

export type JiraTicket = {
  key: JiraKey;
  type: JiraTicketType;
  project: JiraProject;
  summary: string;
  parent?: JiraTicket;
};

const IssueType = t.interface({
  name: t.union([
    t.literal("Epic"),
    t.literal("Story"),
    t.literal("Task"),
    t.literal("Sottotask"),
    t.literal("Bug")
  ]),
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

export const RemoteJiraTicket = t.interface({
  id: t.string,
  key: t.string,
  fields: Fields
});

export type RemoteJiraTicket = t.TypeOf<typeof RemoteJiraTicket>;
