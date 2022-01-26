import { range } from "fp-ts/lib/Array";
import reducer, { MAX_APP_VERSION_HISTORY_SIZE } from "../installation";
import { applicationChangeState } from "../../actions/application";
import {
  appVersionHistory,
  previousInstallationDataDeleteSuccess
} from "../../actions/installation";

describe("installation reducer", () => {
  describe("when the store is empty", () => {
    describe("given an action that doesn't trigger the reducer", () => {
      it("should return the initial state", () => {
        expect(reducer(undefined, applicationChangeState("active"))).toEqual({
          isFirstRunAfterInstall: true,
          appVersionHistory: []
        });
      });
    });
    describe("given the action previousInstallationDataDeleteSuccess", () => {
      it("should return the state updated", () => {
        expect(
          reducer(undefined, previousInstallationDataDeleteSuccess())
            .isFirstRunAfterInstall
        ).toBeFalsy();
      });
    });

    describe("given the action appVersionHistory", () => {
      it("should return the state updated", () => {
        expect(
          reducer(undefined, appVersionHistory("versionX")).appVersionHistory
        ).toEqual(["versionX"]);
      });
    });

    describe("given the actions previousInstallationDataDeleteSuccess & appVersionHistory", () => {
      it("should return the state updated", () => {
        const state = reducer(
          undefined,
          previousInstallationDataDeleteSuccess()
        );
        const state1 = reducer(state, appVersionHistory("versionX"));
        expect(state1).toEqual({
          isFirstRunAfterInstall: false,
          appVersionHistory: ["versionX"]
        });
      });
    });

    describe("given multiple appVersionHistory", () => {
      it("should return the state updated in the right order", () => {
        const state = reducer(undefined, appVersionHistory("versionX"));
        const state1 = reducer(state, appVersionHistory("versionY"));
        expect(state1.appVersionHistory).toEqual(["versionX", "versionY"]);
      });
    });

    describe("given multiple appVersionHistory with the same version", () => {
      it("should return the state updated no duplicated version", () => {
        const state = reducer(undefined, appVersionHistory("versionX"));
        const state1 = reducer(state, appVersionHistory("versionX"));
        expect(state1.appVersionHistory).toEqual(["versionX"]);
      });
    });

    describe("given multiple appVersionHistory (> size allowed)", () => {
      it("should return the state updated with the size <= max allowed", () => {
        const versions = range(1, MAX_APP_VERSION_HISTORY_SIZE + 10).reduce(
          (acc: Array<string>, curr: number) =>
            reducer(
              {
                isFirstRunAfterInstall: false,
                appVersionHistory: acc
              },
              appVersionHistory(`version_${curr}`)
            ).appVersionHistory,
          []
        );
        expect(versions.length).toEqual(MAX_APP_VERSION_HISTORY_SIZE);
      });
    });
  });
});
