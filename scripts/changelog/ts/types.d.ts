// TODO: create types for pivotaljs

export type StoryType = "feature" | "bug" | "chore" | "release";
export type StoryCurrentState =
  | "accepted"
  | "delivered"
  | "finished"
  | "started"
  | "rejected"
  | "planned"
  | "unstarted"
  | "unscheduled";

export type Label = {
  id: number;
  project_id: number;
  kind: string;
  name: string;
  // TODO: should be date
  created_at: string;
  updated_at: string;
};

export type Story = {
  id: string;
  story_type: StoryType;
  created_at: string;
  updated_at: string;
  estimate: number;
  name: string;
  current_state: StoryCurrentState;
  url: string;
  project_id: string;
  labels: ReadonlyArray<Label>;
};
