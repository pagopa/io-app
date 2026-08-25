import { getType } from "typesafe-actions";

import { Action } from "../../../../../store/actions/types";
import { MixPanelCredential } from "../../../analytics/utils/types";
import { EidActivationExitStep } from "../../hooks/useItwActivationExitSurveyBottomSheet.tsx";
import { CredentialExitStep } from "../../hooks/useItwCredentialExitSurveyBottomSheet.tsx";
import {
  itwSetActivationExitSurvey,
  itwSetCredentialExitSurvey,
  itwSetFeedbackBottomSheetVisible
} from "../actions/ui";

export type ItwUiState = Readonly<{
  activationExitSurvey: undefined | { step: EidActivationExitStep };
  credentialExitSurvey:
    | undefined
    | { credential: MixPanelCredential; step: CredentialExitStep };
  itwFeedbackBottomSheet: boolean;
}>;

export const itwUiInitialState: ItwUiState = {
  itwFeedbackBottomSheet: false,
  activationExitSurvey: undefined,
  credentialExitSurvey: undefined
};

const reducer = (
  state: ItwUiState = itwUiInitialState,
  action: Action
): ItwUiState => {
  switch (action.type) {
    case getType(itwSetActivationExitSurvey):
      return { ...state, activationExitSurvey: action.payload };

    case getType(itwSetCredentialExitSurvey):
      return { ...state, credentialExitSurvey: action.payload };

    case getType(itwSetFeedbackBottomSheetVisible):
      return { ...state, itwFeedbackBottomSheet: action.payload };

    default:
      return state;
  }
};

export default reducer;
