import { applicationChangeState } from "../../../../../../store/actions/application";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  itwSetActivationExitSurvey,
  itwSetCredentialExitSurvey,
  itwSetFeedbackBottomSheetVisible
} from "../../actions/ui";
import {
  itwActivationExitSurveySelector,
  itwCredentialExitSurveySelector,
  itwFeedbackBottomSheetVisibleSelector
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
      itwSetFeedbackBottomSheetVisible(true)
    );
    expect(shown.itwFeedbackBottomSheet).toBe(true);

    const hidden = reducer(shown, itwSetFeedbackBottomSheetVisible(false));
    expect(hidden.itwFeedbackBottomSheet).toBe(false);
  });

  it("should show and hide the activationExitSurvey", () => {
    const shown = reducer(
      itwUiInitialState,
      itwSetActivationExitSurvey({ step: "intro" })
    );
    expect(shown.activationExitSurvey).toEqual({ step: "intro" });

    const hidden = reducer(shown, itwSetActivationExitSurvey(undefined));
    expect(hidden.activationExitSurvey).toBeUndefined();
  });

  it("should show and hide the credentialExitSurvey", () => {
    const shown = reducer(
      itwUiInitialState,
      itwSetCredentialExitSurvey({
        step: "data_share",
        credential: "ITW_PID"
      })
    );
    expect(shown.credentialExitSurvey).toEqual({
      step: "data_share",
      credential: "ITW_PID"
    });

    const hidden = reducer(shown, itwSetCredentialExitSurvey(undefined));
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

  it("itwFeedbackBottomSheetVisibleSelector should return the flag", () => {
    expect(itwFeedbackBottomSheetVisibleSelector(state)).toBe(true);
  });

  it("itwActivationExitSurveySelector should return the activation exit survey state", () => {
    expect(itwActivationExitSurveySelector(state)).toEqual({ step: "intro" });
  });

  it("itwCredentialExitSurveySelector should return the credential exit survey state", () => {
    expect(itwCredentialExitSurveySelector(state)).toEqual({
      step: "data_share",
      credential: "ITW_PID"
    });
  });
});
