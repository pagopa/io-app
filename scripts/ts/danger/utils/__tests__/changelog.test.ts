import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import {
  androidLabelAndOtherStory,
  baseStory,
  baseStoryWithGenericLabel,
  bonusVacanzeStory,
  bonusVacanzeStoryWithScopeLabel,
  clashScopeLabelStory,
  scopeLabelNotAllowedStory,
  singleAndroidLabelStory,
  singleEpicBpdStory
} from "../__mocks__/storyMock";
import { getChangelogScope, getStoryChangelogScope } from "../changelog";
import { fromPivotalToGenericTicket } from "../../../common/ticket/types";

describe("Test pivotal Utility", () => {
  it("getStoryChangelogScope on a story without labels should return Right O.none", () => {
    const eitherScope = getStoryChangelogScope(
      fromPivotalToGenericTicket(baseStory)
    );
    expect(E.isRight(eitherScope)).toBeTruthy();
    if (E.isRight(eitherScope)) {
      expect(eitherScope.right).toBe(O.none);
    }
  });
  it("getStoryChangelogScope on a story with a normal label (not scope tag) should return Right,O.none", () => {
    const eitherScope = getStoryChangelogScope(
      fromPivotalToGenericTicket(baseStoryWithGenericLabel)
    );
    expect(E.isRight(eitherScope)).toBeTruthy();
    if (E.isRight(eitherScope)) {
      expect(eitherScope.right).toBe(O.none);
    }
  });
  it("getStoryChangelogScope on a story without label but belonging to a project that assigns a scope should return Right,string", () => {
    const eitherScope = getStoryChangelogScope(
      fromPivotalToGenericTicket(bonusVacanzeStory)
    );
    expect(E.isRight(eitherScope)).toBeTruthy();
    if (E.isRight(eitherScope) && O.isSome(eitherScope.right)) {
      expect(eitherScope.right.value).toBe("Bonus Vacanze");
      return;
    }
    fail(
      "Condition E.isRight(eitherScope) && eitherScope.value.O.isSome() not satisfied"
    );
  });
  it("getStoryChangelogScope on a story with scope label should return Right,string", () => {
    const eitherScope = getStoryChangelogScope(
      fromPivotalToGenericTicket(singleAndroidLabelStory)
    );
    expect(E.isRight(eitherScope)).toBeTruthy();
    if (E.isRight(eitherScope) && O.isSome(eitherScope.right)) {
      expect(eitherScope.right.value).toBe("Android");
      return;
    }
    fail(
      "Condition E.isRight(eitherScope) && eitherScope.value.O.isSome() not satisfied"
    );
  });
  it("getStoryChangelogScope on a story with epic label should return Right,string", () => {
    const eitherScope = getStoryChangelogScope(
      fromPivotalToGenericTicket(singleEpicBpdStory)
    );
    expect(E.isRight(eitherScope)).toBeTruthy();
    if (E.isRight(eitherScope) && O.isSome(eitherScope.right)) {
      expect(eitherScope.right.value).toBe("Bonus Pagamenti Digitali");
      return;
    }
    fail(
      "Condition E.isRight(eitherScope) && eitherScope.value.O.isSome() not satisfied"
    );
  });
  it("getStoryChangelogScope on a story with scope label and other labels should return Right,string", () => {
    const eitherScope = getStoryChangelogScope(
      fromPivotalToGenericTicket(androidLabelAndOtherStory)
    );
    expect(E.isRight(eitherScope)).toBeTruthy();
    if (E.isRight(eitherScope) && O.isSome(eitherScope.right)) {
      expect(eitherScope.right.value).toBe("Android");
      return;
    }
    fail(
      "Condition E.isRight(eitherScope) && eitherScope.value.O.isSome() not satisfied"
    );
  });
  it("getStoryChangelogScope on a story with different scope labels should return Left,Error", () => {
    const eitherScope = getStoryChangelogScope(
      fromPivotalToGenericTicket(clashScopeLabelStory)
    );
    expect(E.isLeft(eitherScope)).toBeTruthy();
  });
  it("getStoryChangelogScope on a story with scope label not allowed should return Right,O.none", () => {
    const eitherScope = getStoryChangelogScope(
      fromPivotalToGenericTicket(scopeLabelNotAllowedStory)
    );
    expect(E.isRight(eitherScope)).toBeTruthy();
    if (E.isRight(eitherScope)) {
      expect(eitherScope.right).toBe(O.none);
    }
  });
  it("getStoryChangelogScope on a story with a scope labels and belonging to a project that assigns a scope should return Left,Error", () => {
    const eitherScope = getStoryChangelogScope(
      fromPivotalToGenericTicket(bonusVacanzeStoryWithScopeLabel)
    );
    expect(E.isLeft(eitherScope)).toBeTruthy();
  });

  it("getChangelogScope on an empty array should return O.none", () => {
    const eitherScope = getChangelogScope([]);
    expect(E.isRight(eitherScope)).toBeTruthy();
    if (E.isRight(eitherScope)) {
      expect(eitherScope.right).toBe(O.none);
    }
  });

  it("getChangelogScope with a single story without scope label should return Right, O.none", () => {
    const eitherScope = getChangelogScope([
      fromPivotalToGenericTicket(baseStoryWithGenericLabel)
    ]);
    expect(E.isRight(eitherScope)).toBeTruthy();
    if (E.isRight(eitherScope)) {
      expect(eitherScope.right).toBe(O.none);
    }
  });
  it("getChangelogScope with a single story with scope label should return Right, some", () => {
    const eitherScope = getChangelogScope([
      fromPivotalToGenericTicket(singleAndroidLabelStory)
    ]);
    expect(E.isRight(eitherScope)).toBeTruthy();
    if (E.isRight(eitherScope) && O.isSome(eitherScope.right)) {
      expect(eitherScope.right.value).toBe("Android");
      return;
    }
    fail(
      "Condition E.isRight(eitherScope) && eitherScope.value.O.isSome() not satisfied"
    );
  });
  it("getChangelogScope with a multiple stories with the same scope label should return Right, some", () => {
    const eitherScope = getChangelogScope([
      fromPivotalToGenericTicket(singleAndroidLabelStory),
      fromPivotalToGenericTicket(singleAndroidLabelStory),
      fromPivotalToGenericTicket(singleAndroidLabelStory)
    ]);
    expect(E.isRight(eitherScope)).toBeTruthy();
    if (E.isRight(eitherScope) && O.isSome(eitherScope.right)) {
      expect(eitherScope.right.value).toBe("Android");
      return;
    }
    fail(
      "Condition E.isRight(eitherScope) && eitherScope.value.O.isSome() not satisfied"
    );
  });
  it("getChangelogScope with stories with different scopes should return Left, error[] with 1 error", () => {
    const eitherScope = getChangelogScope([
      fromPivotalToGenericTicket(singleAndroidLabelStory),
      fromPivotalToGenericTicket(bonusVacanzeStory)
    ]);
    expect(E.isLeft(eitherScope)).toBeTruthy();
    if (E.isLeft(eitherScope)) {
      expect(eitherScope.left.length).toBe(1);
    }
  });
  it(
    "getChangelogScope with stories with different scopes (foreach story) should return Left, " +
      "error[] with 2 error",
    () => {
      const eitherScope = getChangelogScope([
        fromPivotalToGenericTicket(clashScopeLabelStory),
        fromPivotalToGenericTicket(bonusVacanzeStoryWithScopeLabel)
      ]);
      expect(E.isLeft(eitherScope)).toBeTruthy();
      if (E.isLeft(eitherScope)) {
        expect(eitherScope.left.length).toBe(2);
      }
    }
  );
});
