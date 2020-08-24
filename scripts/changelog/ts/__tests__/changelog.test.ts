import { none } from "fp-ts/lib/Option";
import {
  androidLabelAndOtherStory,
  baseStory,
  baseStoryWithGenericLabel,
  bonusVacanzeStory,
  bonusVacanzeStoryWithScopeLabel,
  clashScopeLabelStory,
  singleAndroidLabelStory
} from "../__mocks__/storyMock";
import { getChangelogScope, getStoryChangelogScope } from "../changelog";

describe("Test pivotal Utility", () => {
  it("getStoryChangelogScope on a story without labels should return Right none", () => {
    const eitherScope = getStoryChangelogScope(baseStory);
    expect(eitherScope.isRight()).toBeTruthy();
    if (eitherScope.isRight()) {
      expect(eitherScope.value).toBe(none);
    }
  });
  it("getStoryChangelogScope on a story with a normal label (not scope tag) should return Right,none", () => {
    const eitherScope = getStoryChangelogScope(baseStoryWithGenericLabel);
    expect(eitherScope.isRight()).toBeTruthy();
    if (eitherScope.isRight()) {
      expect(eitherScope.value).toBe(none);
    }
  });
  it("getStoryChangelogScope on a story without label but belonging to a project that assigns a scope should return Right,string", () => {
    const eitherScope = getStoryChangelogScope(bonusVacanzeStory);
    expect(eitherScope.isRight()).toBeTruthy();
    if (eitherScope.isRight() && eitherScope.value.isSome()) {
      expect(eitherScope.value.value).toBe("Bonus Vacanze");
      return;
    }
    fail(
      "Condition eitherScope.isRight() && eitherScope.value.isSome() not satisfied"
    );
  });
  it("getStoryChangelogScope on a story with scope label should return Right,string", () => {
    const eitherScope = getStoryChangelogScope(singleAndroidLabelStory);
    expect(eitherScope.isRight()).toBeTruthy();
    if (eitherScope.isRight() && eitherScope.value.isSome()) {
      expect(eitherScope.value.value).toBe("Android");
      return;
    }
    fail(
      "Condition eitherScope.isRight() && eitherScope.value.isSome() not satisfied"
    );
  });
  it("getStoryChangelogScope on a story with scope label and other labels should return Right,string", () => {
    const eitherScope = getStoryChangelogScope(androidLabelAndOtherStory);
    expect(eitherScope.isRight()).toBeTruthy();
    if (eitherScope.isRight() && eitherScope.value.isSome()) {
      expect(eitherScope.value.value).toBe("Android");
      return;
    }
    fail(
      "Condition eitherScope.isRight() && eitherScope.value.isSome() not satisfied"
    );
  });
  it("getStoryChangelogScope on a story with different scope labels should return Left,Error", () => {
    const eitherScope = getStoryChangelogScope(clashScopeLabelStory);
    expect(eitherScope.isLeft()).toBeTruthy();
  });
  it("getStoryChangelogScope on a story with a scope labels and belonging to a project that assigns a scope should return Left,Error", () => {
    const eitherScope = getStoryChangelogScope(bonusVacanzeStoryWithScopeLabel);
    expect(eitherScope.isLeft()).toBeTruthy();
  });

  it("getChangelogScope on an empty array should return none", () => {
    const eitherScope = getChangelogScope([]);
    expect(eitherScope.isRight()).toBeTruthy();
    expect(eitherScope.value).toBe(none);
  });

  it("getChangelogScope with a single story without scope label should return Right, none", () => {
    const eitherScope = getChangelogScope([baseStoryWithGenericLabel]);
    expect(eitherScope.isRight()).toBeTruthy();
    expect(eitherScope.value).toBe(none);
  });
  it("getChangelogScope with a single story with scope label should return Right, some", () => {
    const eitherScope = getChangelogScope([singleAndroidLabelStory]);
    expect(eitherScope.isRight()).toBeTruthy();
    if (eitherScope.isRight() && eitherScope.value.isSome()) {
      expect(eitherScope.value.value).toBe("Android");
      return;
    }
    fail(
      "Condition eitherScope.isRight() && eitherScope.value.isSome() not satisfied"
    );
  });
  it("getChangelogScope with a multiple stories with the same scope label should return Right, some", () => {
    const eitherScope = getChangelogScope([
      singleAndroidLabelStory,
      singleAndroidLabelStory,
      singleAndroidLabelStory
    ]);
    expect(eitherScope.isRight()).toBeTruthy();
    if (eitherScope.isRight() && eitherScope.value.isSome()) {
      expect(eitherScope.value.value).toBe("Android");
      return;
    }
    fail(
      "Condition eitherScope.isRight() && eitherScope.value.isSome() not satisfied"
    );
  });
  it("getChangelogScope with stories with different scopes should return Left, error[] with 1 error", () => {
    const eitherScope = getChangelogScope([
      singleAndroidLabelStory,
      bonusVacanzeStory
    ]);
    expect(eitherScope.isLeft()).toBeTruthy();
    if (eitherScope.isLeft()) {
      expect(eitherScope.value.length).toBe(1);
    }
  });
  it(
    "getChangelogScope with stories with different scopes (foreach story) should return Left, " +
      "error[] with 2 error",
    () => {
      const eitherScope = getChangelogScope([
        clashScopeLabelStory,
        bonusVacanzeStoryWithScopeLabel
      ]);
      expect(eitherScope.isLeft()).toBeTruthy();
      if (eitherScope.isLeft()) {
        expect(eitherScope.value.length).toBe(2);
      }
    }
  );
});
