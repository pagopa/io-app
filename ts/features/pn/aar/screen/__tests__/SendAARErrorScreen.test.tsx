import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import PN_ROUTES from "../../../navigation/routes";
import * as ERROR_COMPONENT from "../../components/errors/SendAARErrorComponent";
import * as NOT_ADDRESSEE_COMPONENT from "../../components/errors/SendAarNotAddresseeKoComponent";
import { sendAARFlowStates } from "../../utils/stateUtils";
import { SendAARErrorScreen } from "../SendAARErrorScreen";
import { sendAarMockStates } from "../../utils/testUtils";
import * as SELECTORS from "../../store/selectors";
import * as ANALYTICS from "../../analytics";
import * as NFC_NOT_SUPPORTED_COMPONENT from "../../components/errors/SendAarNfcNotSupportedComponent";

describe("SendAARErrorScreen", () => {
  const notAddresseeComponentSpy = jest
    .spyOn(NOT_ADDRESSEE_COMPONENT, "SendAarNotAddresseeKoComponent")
    .mockImplementation();
  const errorComponentSpy = jest
    .spyOn(ERROR_COMPONENT, "SendAarGenericErrorComponent")
    .mockImplementation();
  const nfcNotSupportedComponentSpy = jest
    .spyOn(NFC_NOT_SUPPORTED_COMPONENT, "SendAarNfcNotSupportedComponent")
    .mockImplementation();

  const getSpecificErrorScreenSpy = (stateType: string) => {
    switch (stateType) {
      case sendAARFlowStates.notAddresseeFinal:
        return notAddresseeComponentSpy;
      case sendAARFlowStates.nfcNotSupportedFinal:
        return nfcNotSupportedComponentSpy;
      default:
        return errorComponentSpy;
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  sendAarMockStates.forEach(mockState => {
    it(`should ${
      mockState.type === sendAARFlowStates.notAddresseeFinal ? "" : "not "
    }call trackSendAARAccessDeniedScreenView when state is ${
      mockState.type
    }`, () => {
      jest
        .spyOn(SELECTORS, "currentAARFlowStateType")
        .mockImplementation(_state => mockState.type);
      const spiedOnMockedTrackSendAARAccessDeniedScreenView = jest
        .spyOn(ANALYTICS, "trackSendAARAccessDeniedScreenView")
        .mockImplementation();

      renderScreen();

      if (mockState.type === sendAARFlowStates.notAddresseeFinal) {
        expect(
          spiedOnMockedTrackSendAARAccessDeniedScreenView.mock.calls.length
        ).toBe(1);
        expect(
          spiedOnMockedTrackSendAARAccessDeniedScreenView.mock.calls[0].length
        ).toBe(0);
      } else {
        expect(
          spiedOnMockedTrackSendAARAccessDeniedScreenView.mock.calls.length
        ).toBe(0);
      }
    });
    const specificErrorScreenSpy = getSpecificErrorScreenSpy(mockState.type);
    const isSpecificErrorScreen = specificErrorScreenSpy !== undefined;
    it(`should render ${
      isSpecificErrorScreen
        ? "a dedicated error screen"
        : "the standard error screen"
    } when the AAR state is ${mockState.type} `, () => {
      jest
        .spyOn(SELECTORS, "currentAARFlowStateType")
        .mockImplementation(_state => mockState.type);

      expect(specificErrorScreenSpy).not.toHaveBeenCalled();
      renderScreen();
      expect(specificErrorScreenSpy).toHaveBeenCalled();
    });
  });
});

const renderScreen = () => {
  const baseState = appReducer(undefined, applicationChangeState("active"));
  const globalState = {
    ...baseState
  } as GlobalState;
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <SendAARErrorScreen />,
    PN_ROUTES.SEND_AAR_ERROR,
    {},
    createStore(appReducer, globalState as any)
  );
};
