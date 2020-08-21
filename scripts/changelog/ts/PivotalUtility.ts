import { warn } from "danger";
import { fromNullable, none, Option, some } from "fp-ts/lib/Option";
import { Story, StoryType } from "./types";

const storyTag = new Map<StoryType, string>([
  ["feature", "feat: "],
  ["bug", "fix: "],
  ["chore", "chore: "]
]);

const storyOrder = new Map<StoryType, number>([
  ["feature", 2],
  ["bug", 1],
  ["chore", 0]
]);

export const getChangelogPrefixByStories = (
  stories: ReadonlyArray<Story>
): Option<string> => {
  // check if all the stories are of the same type
  const allStoriesSameType = stories.every(
    (val, _, arr) => val.story_type === arr[0].story_type
  );
  if (!allStoriesSameType) {
    warn(
      "Multiple stories with different types are associated with this Pull request. " +
        "Only one tag will be added, following the order: `feature > bug > chore`"
    );
  }
  // In case of multiple stories, only one tag can be added, following the order feature > bug > chore
  const storyType = stories.reduce<Option<StoryType>>((acc, val) => {
    const currentStoryOrder = fromNullable(storyOrder.get(val.story_type));
    const prevStoryOrder = acc.chain(v => fromNullable(storyOrder.get(v)));

    if (currentStoryOrder.isSome() && prevStoryOrder.isSome()) {
      return currentStoryOrder.value > prevStoryOrder.value
        ? some(val.story_type)
        : acc;
    } else if (currentStoryOrder.isSome()) {
      return some(val.story_type);
    }
    return acc;
  }, none);

  // If a tag can be associated to a story, update the pr title
  return storyType.chain(st => fromNullable(storyTag.get(st)));
};
