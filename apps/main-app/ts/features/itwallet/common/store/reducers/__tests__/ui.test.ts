import { applicationChangeState } from "../../../../../../store/actions/application";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  itwSetActivationExitSurvey,
  itwSetCredentialExitSurvey
} from "../../actions/ui";
import {
  itwActivationExitSurveySelector,
  itwCredentialExitSurveySelector
} from "../../selectors/ui";
import reducer, { itwUiInitialState, ItwUiState } from "../ui";

describe("IT Wallet ui reducer", () => {
  it("should return the initial state", () => {
    expect(reducer(undefined, applicationChangeState("active"))).toEqual(
      itwUiInitialState
    );
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
    activationExitSurvey: { step: "intro" },
    credentialExitSurvey: { step: "data_share", credential: "ITW_PID" }
  };
  const state = {
    features: { itWallet: { ui: uiState } }
  } as GlobalState;

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
