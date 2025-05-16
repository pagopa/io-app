import * as pot from "@pagopa/ts-commons/lib/pot";
import { GlobalState } from "../../../../../store/reducers/types";

import { UserDataProcessingChoiceEnum } from "../../../../../../definitions/backend/UserDataProcessingChoice";
import {
  isUserDataProcessingDeleteErrorSelector,
  isUserDataProcessingDeleteLoadingSelector,
  userDataProcessingSelector
} from "../selectors/userDataProcessing";

describe("userDataProcessing selectors", () => {
  it("should return the whole userDataProcessing state", () => {
    const state = {
      userDataProcessing: {
        [UserDataProcessingChoiceEnum.DELETE]: pot.none,
        [UserDataProcessingChoiceEnum.DOWNLOAD]: pot.none
      }
    } as GlobalState;

    expect(userDataProcessingSelector(state)).toEqual(state.userDataProcessing);
  });

  it("should return true if DELETE is loading", () => {
    const state = {
      userDataProcessing: {
        [UserDataProcessingChoiceEnum.DELETE]: pot.toLoading(pot.none),
        [UserDataProcessingChoiceEnum.DOWNLOAD]: pot.none
      }
    } as GlobalState;

    expect(isUserDataProcessingDeleteLoadingSelector(state)).toBe(true);
  });

  it("should return true if DELETE is updating", () => {
    const state = {
      userDataProcessing: {
        [UserDataProcessingChoiceEnum.DELETE]: pot.toUpdating(
          pot.none,
          undefined
        ),
        [UserDataProcessingChoiceEnum.DOWNLOAD]: pot.none
      }
    } as GlobalState;

    expect(isUserDataProcessingDeleteLoadingSelector(state)).toBe(true);
  });

  it("should return false if DELETE is not loading or updating", () => {
    const state = {
      userDataProcessing: {
        [UserDataProcessingChoiceEnum.DELETE]: pot.none,
        [UserDataProcessingChoiceEnum.DOWNLOAD]: pot.none
      }
    } as GlobalState;

    expect(isUserDataProcessingDeleteLoadingSelector(state)).toBe(false);
  });

  it("should return true if DELETE has an error", () => {
    const state = {
      userDataProcessing: {
        [UserDataProcessingChoiceEnum.DELETE]: pot.toError(
          pot.none,
          new Error("delete failed")
        ),
        [UserDataProcessingChoiceEnum.DOWNLOAD]: pot.none
      }
    } as GlobalState;

    expect(isUserDataProcessingDeleteErrorSelector(state)).toBe(true);
  });

  it("should return false if DELETE does not have an error", () => {
    const state = {
      userDataProcessing: {
        [UserDataProcessingChoiceEnum.DELETE]: pot.none,
        [UserDataProcessingChoiceEnum.DOWNLOAD]: pot.none
      }
    } as GlobalState;

    expect(isUserDataProcessingDeleteErrorSelector(state)).toBe(false);
  });
});
