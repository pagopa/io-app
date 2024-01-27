import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { getJiraTicketExample } from "../__mocks__/genericTicket";
import {
  allStoriesSameType,
  getChangelogPrefixByStories,
  getChangelogScope,
  getTicketChangelogScope
} from "../updatePrTitle";
import { RemoteJiraTicket } from "../../common/jiraTicket/types";

describe("changelog", () => {
  const storyTicket = getJiraTicketExample("Story");
  const subTaskTicket = getJiraTicketExample("Sub-task");
  const bugTicket = getJiraTicketExample("Bug");
  const storyCrossTicket = getJiraTicketExample("Story", "IACROSS");
  const storyFciTicket = getJiraTicketExample("Story", "SFEQS");

  describe("allStoriesSameType", () => {
    it("should return true if all stories have the same type", () => {
      const stories: Array<RemoteJiraTicket> = [storyTicket, storyTicket];
      const result = allStoriesSameType(stories);
      expect(result).toBe(true);
    });

    it("should return false if stories have different types", () => {
      const stories: Array<RemoteJiraTicket> = [storyTicket, subTaskTicket];
      const result = allStoriesSameType(stories);
      expect(result).toBe(false);
    });
  });

  describe("getChangelogPrefixByStories", () => {
    it("should return the common prefix if all stories have the same type", () => {
      const stories: Array<RemoteJiraTicket> = [storyTicket, storyTicket];
      const result = getChangelogPrefixByStories(stories);
      expect(O.isSome(result)).toBe(true);
      expect(O.getOrElse(() => "")(result)).toBe("feat");
    });

    it("should return feat if stories have different types but there's at least one feat", () => {
      const stories: Array<RemoteJiraTicket> = [storyTicket, subTaskTicket];
      const result = getChangelogPrefixByStories(stories);
      expect(O.isSome(result)).toBe(true);
      expect(O.getOrElse(() => "")(result)).toBe("feat");
    });

    it("should return fix if stories has a Bug ticket type", () => {
      const stories: Array<RemoteJiraTicket> = [bugTicket];
      const result = getChangelogPrefixByStories(stories);
      expect(O.isSome(result)).toBe(true);
      expect(O.getOrElse(() => "")(result)).toBe("fix");
    });
  });

  describe("getTicketChangelogScope", () => {
    it("should return the changelog scope if the story belongs to a scope project", () => {
      const result = getTicketChangelogScope(storyCrossTicket);
      expect(O.isSome(result)).toBe(true);
      expect(O.getOrElse(() => "")(result)).toBe("Cross");
    });

    it("should return None if the story doesn't belong to a scope project", () => {
      const result = getTicketChangelogScope(storyTicket);
      expect(O.isNone(result)).toBe(true);
    });
  });

  describe("getChangelogScope", () => {
    it("should return Right(None) if no scope is found", () => {
      const stories: Array<RemoteJiraTicket> = [storyTicket, subTaskTicket];
      const result = getChangelogScope(stories);
      pipe(
        result,
        E.fold(
          () =>
            fail(
              `getChangelogScope shouldn't return Left if no scope is found`
            ),
          scope => {
            expect(O.isNone(scope)).toBe(true);
          }
        )
      );
    });

    it("should return Right(Some(scope)) if one of the stories have a scope or all the stories that have scope have the same scope", () => {
      const stories: Array<RemoteJiraTicket> = [
        storyCrossTicket,
        storyCrossTicket
      ];
      const result = getChangelogScope(stories);
      pipe(
        result,
        E.fold(
          () =>
            fail(
              `getChangelogScope shouldn't return Left if one of the stories have a scope or all the stories that have scope have the same scope`
            ),
          scope => {
            expect(O.isSome(scope)).toBe(true);
            expect(O.getOrElse(() => "")(scope)).toBe("Cross");
          }
        )
      );
    });

    it("should return Left(errors) if two stories have different scope or one of the story have different scope", () => {
      const stories: Array<RemoteJiraTicket> = [
        storyFciTicket,
        storyCrossTicket
      ];
      const result = getChangelogScope(stories);
      expect(E.isLeft(result)).toBe(true);
    });
  });
});
