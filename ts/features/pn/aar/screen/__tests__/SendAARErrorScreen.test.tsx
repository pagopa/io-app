import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import PN_ROUTES from "../../../navigation/routes";
import * as ERROR_COMPONENT from "../../components/errors/SendAARErrorComponent";
import * as NOT_ADDRESSEE_COMPONENT from "../../components/errors/SendAarNotAddresseeKoComponent";
import { AARFlowState, sendAARFlowStates } from "../../utils/stateUtils";
import { SendAARErrorScreen } from "../SendAARErrorScreen";
import { sendAarMockStates } from "../../utils/testUtils";
import * as SELECTORS from "../../store/selectors";
import * as ANALYTICS from "../../analytics";
import * as NFC_NOT_SUPPORTED_COMPONENT from "../../components/errors/SendAarNfcNotSupportedComponent";
import * as ERROR_MAPPINGS from "../../utils/aarErrorMappings";

const handledRetryStates = [sendAARFlowStates.cieCanAdvisory];
const mockReplace = jest.fn();
jest.mock("../../../../../navigation/params/AppParamsList", () => {
  const actualNav = jest.requireActual(
    "../../../../../navigation/params/AppParamsList"
  );
  return {
    ...actualNav,
    useIONavigation: () => ({
      replace: mockReplace
    })
  };
});
describe("SendAARErrorScreen", () => {
  const mockKoComponent = jest.fn().mockImplementation(() => <></>);
  const notAddresseeComponentSpy = jest
    .spyOn(NOT_ADDRESSEE_COMPONENT, "SendAarNotAddresseeKoComponent")
    .mockImplementation();
  const errorComponentSpy = jest
    .spyOn(ERROR_COMPONENT, "SendAarGenericErrorComponent")
    .mockImplementation();
  const nfcNotSupportedComponentSpy = jest
    .spyOn(NFC_NOT_SUPPORTED_COMPONENT, "SendAarNfcNotSupportedComponent")
    .mockImplementation();
  jest
    .spyOn(ERROR_MAPPINGS, "getSendAarErrorComponent")
    .mockImplementation(() => mockKoComponent);

  const getSpecificErrorScreenSpy = (flowState: AARFlowState) => {
    switch (flowState.type) {
      case sendAARFlowStates.notAddresseeFinal:
        return notAddresseeComponentSpy;
      case sendAARFlowStates.nfcNotSupportedFinal:
        return nfcNotSupportedComponentSpy;
      case sendAARFlowStates.ko:
        return mockKoComponent;
      default:
        return undefined;
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
        .spyOn(SELECTORS, "currentAARFlowData")
        .mockImplementation(_state => mockState);
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
    const specificErrorScreenSpy = getSpecificErrorScreenSpy(mockState);
    const isSpecificErrorScreen = specificErrorScreenSpy !== undefined;
    it(`should render ${
      isSpecificErrorScreen
        ? "a dedicated error screen"
        : "the standard error screen"
    } when the AAR state is ${mockState.type} `, () => {
      jest
        .spyOn(SELECTORS, "currentAARFlowData")
        .mockImplementation(_state => mockState);

      if (isSpecificErrorScreen) {
        expect(specificErrorScreenSpy).not.toHaveBeenCalled();
        renderScreen();
        expect(specificErrorScreenSpy).toHaveBeenCalled();
        expect(errorComponentSpy).not.toHaveBeenCalled();
      } else {
        expect(errorComponentSpy).not.toHaveBeenCalled();
        renderScreen();
        expect(errorComponentSpy).toHaveBeenCalled();
      }
    });
    const shouldNavigateToRetry = mockState.type in handledRetryStates;
    it(`${
      shouldNavigateToRetry ? "should" : "should not"
    } navigate to retry screen when the AAR state is ${mockState.type}`, () => {
      jest
        .spyOn(SELECTORS, "currentAARFlowData")
        .mockImplementation(_state => mockState);
      expect(mockReplace).not.toHaveBeenCalled();
      renderScreen();

      if (shouldNavigateToRetry) {
        expect(mockReplace).toHaveBeenCalledTimes(1);
      }
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
