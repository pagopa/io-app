// TODO: create types for pivotaljs

import { IUnitTag } from "@pagopa/ts-commons/lib/units";

export type PivotalStoryType = "feature" | "bug" | "chore" | "release";
export type PivotalStoryCurrentState =
  | "accepted"
  | "delivered"
  | "finished"
  | "started"
  | "rejected"
  | "planned"
  | "unstarted"
  | "unscheduled";

export type PivotalLabel = {
  id: number;
  project_id: number;
  kind: string;
  name: string;
  // TODO: should be date
  created_at: string;
  updated_at: string;
};

export type PivotalId = string & IUnitTag<"PivotalId">;

export type PivotalStory = {
  id: string;
  story_type: PivotalStoryType;
  created_at: string;
  updated_at: string;
  estimate: number;
  name: string;
  current_state: PivotalStoryCurrentState;
  url: string;
  project_id: number;
  labels: ReadonlyArray<PivotalLabel>;
};
