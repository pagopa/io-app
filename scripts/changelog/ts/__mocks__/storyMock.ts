import { Label, Story } from "../types";

export const baseStory: Story = {
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

export const baseLabel: Label = {
  id: 5,
  project_id: 21,
  kind: "label",
  name: "generic-label",
  created_at: "date",
  updated_at: "date"
};

export const scopeLabeliOS: Label = {
  ...baseLabel,
  name: "changelog-scope:ios"
};

export const scopeLabelAndroid: Label = {
  ...baseLabel,
  name: "changelog-scope:android"
};

export const scopeLabelNotAllowed: Label = {
  ...baseLabel,
  name: "changelog-scope:not-allowed"
};

export const bonusVacanzeStory: Story = {
  ...baseStory,
  project_id: 2449547
};

export const baseStoryWithGenericLabel: Story = {
  ...baseStory,
  labels: [baseLabel]
};

export const bonusVacanzeStoryWithScopeLabel: Story = {
  ...bonusVacanzeStory,
  labels: [scopeLabeliOS]
};

export const singleAndroidLabelStory: Story = {
  ...baseStory,
  labels: [scopeLabelAndroid]
};

export const androidLabelAndOtherStory: Story = {
  ...baseStory,
  labels: [scopeLabelAndroid, baseLabel]
};

export const clashScopeLabelStory: Story = {
  ...baseStory,
  labels: [scopeLabelAndroid, scopeLabeliOS]
};

export const scopeLabelNotAllowedStory: Story = {
  ...baseStory,
  labels: [scopeLabelNotAllowed]
};
