import {
  PivotalLabel,
  PivotalStory
} from "../../../common/ticket/pivotal/types";

export const baseStory: PivotalStory = {
  id: "123",
  story_type: "bug",
  created_at: "date",
  updated_at: "date",
  estimate: 3,
  name: "Come CIT voglio poter utilizzare l'app",
  current_state: "started",
  url: "url",
  project_id: 132,
  labels: []
};

export const baseLabel: PivotalLabel = {
  id: 5,
  project_id: 21,
  kind: "label",
  name: "generic-label",
  created_at: "date",
  updated_at: "date"
};

export const scopeLabeliOS: PivotalLabel = {
  ...baseLabel,
  name: "changelog-scope:ios"
};

export const scopeLabelAndroid: PivotalLabel = {
  ...baseLabel,
  name: "changelog-scope:android"
};

export const scopeLabelEpicBpd: PivotalLabel = {
  ...baseLabel,
  name: "epic-bpd"
};

export const scopeLabelNotAllowed: PivotalLabel = {
  ...baseLabel,
  name: "changelog-scope:not-allowed"
};

export const bonusVacanzeStory: PivotalStory = {
  ...baseStory,
  project_id: 2449547
};

export const baseStoryWithGenericLabel: PivotalStory = {
  ...baseStory,
  labels: [baseLabel]
};

export const bonusVacanzeStoryWithScopeLabel: PivotalStory = {
  ...bonusVacanzeStory,
  labels: [scopeLabeliOS]
};

export const singleAndroidLabelStory: PivotalStory = {
  ...baseStory,
  labels: [scopeLabelAndroid]
};

export const singleEpicBpdStory: PivotalStory = {
  ...baseStory,
  labels: [scopeLabelEpicBpd]
};

export const androidLabelAndOtherStory: PivotalStory = {
  ...baseStory,
  labels: [scopeLabelAndroid, baseLabel]
};

export const clashScopeLabelStory: PivotalStory = {
  ...baseStory,
  labels: [scopeLabelAndroid, scopeLabeliOS]
};

export const scopeLabelNotAllowedStory: PivotalStory = {
  ...baseStory,
  labels: [scopeLabelNotAllowed]
};
