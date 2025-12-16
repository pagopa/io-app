import * as pot from "@pagopa/ts-commons/lib/pot";

import { UserDataProcessingChoiceEnum } from "../../../../../../definitions/backend/UserDataProcessingChoice";
import { UserDataProcessingStatusEnum } from "../../../../../../definitions/backend/UserDataProcessingStatus";
import { UserDataProcessing } from "../../../../../../definitions/backend/UserDataProcessing";
import userDataProcessingReducer, {
  INITIAL_STATE,
  UserDataProcessingState
} from "../reducers/userDataProcessing";
import {
  loadUserDataProcessing,
  resetDeleteUserDataProcessing,
  resetUserDataProcessingRequest,
  upsertUserDataProcessing
} from "../actions/userDataProcessing";
import { clearCache } from "../actions";

describe("userDataProcessingReducer", () => {
  const fakeDownload: UserDataProcessing = {
    choice: UserDataProcessingChoiceEnum.DOWNLOAD,
    status: UserDataProcessingStatusEnum.PENDING,
    version: 1,
    created_at: new Date(),
    updated_at: new Date()
  };

  const fakeDelete: UserDataProcessing = {
    choice: UserDataProcessingChoiceEnum.DELETE,
    status: UserDataProcessingStatusEnum.PENDING,
    version: 1,
    created_at: new Date(),
    updated_at: new Date()
  };

  it("should handle loadUserDataProcessing.request", () => {
    const state = userDataProcessingReducer(
      INITIAL_STATE,
      loadUserDataProcessing.request(UserDataProcessingChoiceEnum.DOWNLOAD)
    );

    expect(pot.isLoading(state.DOWNLOAD)).toBe(true);
  });

  it("should handle loadUserDataProcessing.success", () => {
    const state = userDataProcessingReducer(
      INITIAL_STATE,
      loadUserDataProcessing.success({
        choice: UserDataProcessingChoiceEnum.DOWNLOAD,
        value: fakeDownload
      })
    );

    expect(pot.isSome(state.DOWNLOAD)).toBe(true);
    if (pot.isSome(state.DOWNLOAD)) {
      expect(state.DOWNLOAD.value).toEqual(fakeDownload);
    }
  });

  it("should handle loadUserDataProcessing.failure", () => {
    const error = new Error("failure");
    const state = userDataProcessingReducer(
      INITIAL_STATE,
      loadUserDataProcessing.failure({
        choice: UserDataProcessingChoiceEnum.DOWNLOAD,
        error
      })
    );

    expect(pot.isError(state.DOWNLOAD)).toBe(true);
  });

  it("should handle upsertUserDataProcessing.request", () => {
    const state = userDataProcessingReducer(
      INITIAL_STATE,
      upsertUserDataProcessing.request(UserDataProcessingChoiceEnum.DOWNLOAD)
    );

    expect(pot.isUpdating(state.DOWNLOAD)).toBe(true);
  });

  it("should handle upsertUserDataProcessing.success", () => {
    const state = userDataProcessingReducer(
      INITIAL_STATE,
      upsertUserDataProcessing.success(fakeDownload)
    );

    expect(pot.isSome(state.DOWNLOAD)).toBe(true);

    if (pot.isSome(state.DOWNLOAD)) {
      expect(state.DOWNLOAD.value).toEqual(fakeDownload);
    }
  });

  it("should handle upsertUserDataProcessing.failure", () => {
    const error = new Error("update failed");
    const state = userDataProcessingReducer(
      INITIAL_STATE,
      upsertUserDataProcessing.failure({
        choice: UserDataProcessingChoiceEnum.DOWNLOAD,
        error
      })
    );

    expect(pot.isError(state.DOWNLOAD)).toBe(true);
  });

  it("should handle resetUserDataProcessingRequest", () => {
    const loadingState: UserDataProcessingState = {
      [UserDataProcessingChoiceEnum.DOWNLOAD]: pot.toLoading(pot.none),
      [UserDataProcessingChoiceEnum.DELETE]: pot.none
    };

    const state = userDataProcessingReducer(
      loadingState,
      resetUserDataProcessingRequest(UserDataProcessingChoiceEnum.DOWNLOAD)
    );

    expect(state.DOWNLOAD).toEqual(pot.none);
  });

  it("should handle resetDeleteUserDataProcessing", () => {
    const someState: UserDataProcessingState = {
      [UserDataProcessingChoiceEnum.DOWNLOAD]: pot.none,
      [UserDataProcessingChoiceEnum.DELETE]: pot.some(fakeDelete)
    };

    const state = userDataProcessingReducer(
      someState,
      resetDeleteUserDataProcessing()
    );

    expect(state.DELETE).toEqual(pot.some(fakeDelete));
  });

  it("should handle clearCache", () => {
    const someState: UserDataProcessingState = {
      [UserDataProcessingChoiceEnum.DOWNLOAD]: pot.some(fakeDownload),
      [UserDataProcessingChoiceEnum.DELETE]: pot.some(fakeDelete)
    };

    const state = userDataProcessingReducer(someState, clearCache());

    expect(state).toEqual(INITIAL_STATE);
  });
});
