import {
  uiHideActivationExitSurvey,
  uiHideCredentialExitSurvey,
  uiHideItwFeedbackBottomSheet,
  uiShowActivationExitSurvey,
  uiShowCredentialExitSurvey,
  uiShowItwFeedbackBottomSheet
} from "../../actions/ui";
import { GlobalState } from "../types";
import uiReducer, {
  uiActivationExitSurveySelector,
  uiCredentialExitSurveySelector,
  uiItwFeedbackBottomSheetSelector,
  UiState
} from "../ui";

const initialState: UiState = {
  itwFeedbackBottomSheet: false,
  activationExitSurvey: undefined,
  credentialExitSurvey: undefined
};

describe("uiReducer", () => {
  it("should return the initial state", () => {
    expect(uiReducer(undefined, {} as any)).toEqual(initialState);
  });

  it("should show and hide the itwFeedbackBottomSheet flag", () => {
    const shown = uiReducer(initialState, uiShowItwFeedbackBottomSheet());
    expect(shown.itwFeedbackBottomSheet).toBe(true);

    const hidden = uiReducer(shown, uiHideItwFeedbackBottomSheet());
    expect(hidden.itwFeedbackBottomSheet).toBe(false);
  });

  it("should show and hide the activationExitSurvey", () => {
    const shown = uiReducer(
      initialState,
      uiShowActivationExitSurvey({ step: "intro" })
    );
    expect(shown.activationExitSurvey).toEqual({ step: "intro" });

    const hidden = uiReducer(shown, uiHideActivationExitSurvey());
    expect(hidden.activationExitSurvey).toBeUndefined();
  });

  it("should show and hide the credentialExitSurvey", () => {
    const shown = uiReducer(
      initialState,
      uiShowCredentialExitSurvey({
        step: "data_share",
        credential: "ITW_PID"
      })
    );
    expect(shown.credentialExitSurvey).toEqual({
      step: "data_share",
      credential: "ITW_PID"
    });

    const hidden = uiReducer(shown, uiHideCredentialExitSurvey());
    expect(hidden.credentialExitSurvey).toBeUndefined();
  });
});

describe("ui selectors", () => {
  const state = {
    ui: {
      itwFeedbackBottomSheet: true,
      activationExitSurvey: { step: "intro" },
      credentialExitSurvey: { step: "data_share", credential: "ITW_PID" }
    }
  } as GlobalState;

  it("uiItwFeedbackBottomSheetSelector should return the flag", () => {
    expect(uiItwFeedbackBottomSheetSelector(state)).toBe(true);
  });

  it("uiActivationExitSurveySelector should return the activation exit survey state", () => {
    expect(uiActivationExitSurveySelector(state)).toEqual({ step: "intro" });
  });

  it("uiCredentialExitSurveySelector should return the credential exit survey state", () => {
    expect(uiCredentialExitSurveySelector(state)).toEqual({
      step: "data_share",
      credential: "ITW_PID"
    });
  });
});
