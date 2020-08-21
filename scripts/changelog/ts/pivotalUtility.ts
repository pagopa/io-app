import {
  getPivotalStories,
  getPivotalStoryIDs
} from "danger-plugin-digitalcitizenship/dist/utils";
import { Either, left, Right, right } from "fp-ts/lib/Either";
import { fromNullable, none, Option, Some, some } from "fp-ts/lib/Option";
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

export const getPivotalStoriesFromPrTitle = async (
  prTitle: string
): Promise<ReadonlyArray<Story>> => {
  const storyIDs = getPivotalStoryIDs(prTitle);
  return (await getPivotalStories(storyIDs)).filter(
    s => s.story_type !== undefined
  );
};

export const allStoriesSameType = (stories: ReadonlyArray<Story>): boolean =>
  stories.every((val, _, arr) => val.story_type === arr[0].story_type);

export const getChangelogPrefixByStories = (
  stories: ReadonlyArray<Story>
): Option<string> => {
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

const projectToScope = new Map<string, string>([["2449547", "Bonus Vacanze"]]);

export const storiesHaveSingleProject = (stories: ReadonlyArray<Story>) =>
  stories.every((val, _, arr) => val.project_id === arr[0].project_id);

const regex = /changelog-scope:(.*)/m;

export const getStoryChangelogScope = (
  story: Story
): Either<Error, Option<string>> => {
  const maybeProjectScope = fromNullable(projectToScope.get(story.project_id));
  const maybeChangelogScopeTag = story.labels
    .filter(l => l.name.match(regex))
    .map(l => l.name.match(regex)!.pop());

  if (maybeChangelogScopeTag.length > 1) {
    return left(
      new Error(
        `Multiple labels match the expression ${regex} for the story [#${
          story.id
        }].\n
       It is not possible to assign a single scope to this pull request!`
      )
    );
  }
  if (maybeProjectScope.isSome() && maybeChangelogScopeTag.length >= 1) {
    return left(
      new Error(
        `The story [#${story.id}] have the project_id ${
          story.project_id
        } associated with the scope ${
          maybeProjectScope.value
        } but also have labels matching the expression ${regex}.\n
        It is not possible to assign a single scope to this pull request!`
      )
    );
  }
  if (maybeProjectScope.isSome()) {
    return right(maybeProjectScope);
  }
  if (
    maybeChangelogScopeTag.length === 1 &&
    maybeChangelogScopeTag[0] !== undefined
  ) {
    return right(some(maybeChangelogScopeTag[0]));
  }
  return right(none);
};

export const getChangelogScope = (
  stories: ReadonlyArray<Story>
): Either<ReadonlyArray<Error>, Option<string>> => {
  const eitherChangelogScopes = stories.map(getStoryChangelogScope);

  // if there is [1..n] error, forward the errors
  if (eitherChangelogScopes.some(scope => scope.isLeft())) {
    return left(
      eitherChangelogScopes.reduce<ReadonlyArray<Error>>((acc, val) => {
        return val.isLeft() ? [...acc, val.value] : acc;
      }, [])
    );
  }
  const scopesList = eitherChangelogScopes
    .filter(
      (maybeScope): maybeScope is Right<Error, Some<string>> =>
        maybeScope.isRight() && maybeScope.value.isSome()
    )
    .map(scope => scope.value.value);

  if (scopesList.length === 0) {
    return right(none);
  }

  return scopesList.every((scope, _, arr) => scope === arr[0])
    ? right(some(scopesList[0]))
    : left([
        new Error(
          `Different purposes were found on the stories related to the pull request: [${scopesList.join(
            ","
          )}].\n
           It is not possible to assign a single scope to this pull request!`
        )
      ]);
};
