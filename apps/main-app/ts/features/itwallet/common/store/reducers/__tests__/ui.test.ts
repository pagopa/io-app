import { applicationChangeState } from "../../../../../../store/actions/application";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  uiSetActivationExitSurvey,
  uiSetCredentialExitSurvey,
  uiSetItwFeedbackBottomSheetVisible
} from "../../actions/ui";
import {
  uiActivationExitSurveySelector,
  uiCredentialExitSurveySelector,
  uiItwFeedbackBottomSheetSelector
} from "../../selectors/ui";
import reducer, { itwUiInitialState, ItwUiState } from "../ui";

describe("IT Wallet ui reducer", () => {
  it("should return the initial state", () => {
    expect(reducer(undefined, applicationChangeState("active"))).toEqual(
      itwUiInitialState
    );
  });

  it("should show and hide the itwFeedbackBottomSheet flag", () => {
    const shown = reducer(
      itwUiInitialState,
      uiSetItwFeedbackBottomSheetVisible(true)
    );
    expect(shown.itwFeedbackBottomSheet).toBe(true);

    const hidden = reducer(shown, uiSetItwFeedbackBottomSheetVisible(false));
    expect(hidden.itwFeedbackBottomSheet).toBe(false);
  });

  it("should show and hide the activationExitSurvey", () => {
    const shown = reducer(
      itwUiInitialState,
      uiSetActivationExitSurvey({ step: "intro" })
    );
    expect(shown.activationExitSurvey).toEqual({ step: "intro" });

    const hidden = reducer(shown, uiSetActivationExitSurvey(undefined));
    expect(hidden.activationExitSurvey).toBeUndefined();
  });

  it("should show and hide the credentialExitSurvey", () => {
    const shown = reducer(
      itwUiInitialState,
      uiSetCredentialExitSurvey({
        step: "data_share",
        credential: "ITW_PID"
      })
    );
    expect(shown.credentialExitSurvey).toEqual({
      step: "data_share",
      credential: "ITW_PID"
    });

    const hidden = reducer(shown, uiSetCredentialExitSurvey(undefined));
    expect(hidden.credentialExitSurvey).toBeUndefined();
  });
});

describe("ui selectors", () => {
  const uiState: ItwUiState = {
    itwFeedbackBottomSheet: true,
    activationExitSurvey: { step: "intro" },
    credentialExitSurvey: { step: "data_share", credential: "ITW_PID" }
  };
  const state = {
    features: { itWallet: { ui: uiState } }
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
