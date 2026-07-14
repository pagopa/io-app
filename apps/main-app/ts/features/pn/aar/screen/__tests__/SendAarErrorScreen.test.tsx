import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import PN_ROUTES from "../../../navigation/routes";
import * as ERROR_COMPONENT from "../../components/errors/SendAarErrorComponent";
import * as NOT_ADDRESSEE_COMPONENT from "../../components/errors/SendAarNotAddresseeKoComponent";
import {
  AarFlowState,
  AarFlowStateName,
  sendAarFlowStates
} from "../../utils/stateUtils";
import { SendAarErrorScreen } from "../SendAarErrorScreen";
import { sendAarMockStates } from "../../utils/testUtils";
import * as SELECTORS from "../../store/selectors";
import * as ANALYTICS from "../../analytics";
import * as NFC_NOT_SUPPORTED_COMPONENT from "../../components/errors/SendAarNfcNotSupportedComponent";
import * as ERROR_MAPPINGS from "../../utils/aarErrorMappings";
import * as LOADING_SCREEN from "../../../../../components/screens/LoadingScreenContent";

const handledRetryStates: Array<AarFlowStateName> = [
  sendAarFlowStates.cieCanAdvisory
];
const mockReplace = jest.fn();
const mockShouldNeverCall = jest.fn();
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () =>
      new Proxy(actualNav.useNavigation?.(), {
        get: (_target, prop) =>
          prop === "replace" ? mockReplace : mockShouldNeverCall
      })
  };
});
describe("SendAarErrorScreen", () => {
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
  const loadingScreenSpy = jest
    .spyOn(LOADING_SCREEN, "default")
    .mockImplementation(() => <></>);
  jest.spyOn(ERROR_MAPPINGS, "getAarErrorBehaviour").mockImplementation(() => ({
    track: jest.fn(),
    Component: mockKoComponent
  }));

  const getSpecificErrorScreenSpy = (flowState: AarFlowState) => {
    switch (flowState.type) {
      case sendAarFlowStates.notAddresseeFinal:
        return notAddresseeComponentSpy;
      case sendAarFlowStates.nfcNotSupportedFinal:
        return nfcNotSupportedComponentSpy;
      case sendAarFlowStates.ko:
        return mockKoComponent;
      case sendAarFlowStates.cieCanAdvisory:
        return loadingScreenSpy;
      default:
        return undefined;
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  sendAarMockStates.forEach(mockState => {
    it(`should ${
      mockState.type === sendAarFlowStates.notAddresseeFinal ? "" : "not "
    }call trackSendAarAccessDeniedScreenView when state is ${
      mockState.type
    }`, () => {
      jest
        .spyOn(SELECTORS, "currentAarFlowData")
        .mockImplementation(_state => mockState);
      const spiedOnMockedTrackSendAarAccessDeniedScreenView = jest
        .spyOn(ANALYTICS, "trackSendAarAccessDeniedScreenView")
        .mockImplementation();

      renderScreen();

      if (mockState.type === sendAarFlowStates.notAddresseeFinal) {
        expect(
          spiedOnMockedTrackSendAarAccessDeniedScreenView.mock.calls.length
        ).toBe(1);
        expect(
          spiedOnMockedTrackSendAarAccessDeniedScreenView.mock.calls[0].length
        ).toBe(0);
      } else {
        expect(
          spiedOnMockedTrackSendAarAccessDeniedScreenView.mock.calls.length
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
        .spyOn(SELECTORS, "currentAarFlowData")
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
    const shouldNavigateToRetry = handledRetryStates.includes(mockState.type);
    it(`${
      shouldNavigateToRetry ? "should" : "should not"
    } navigate to retry screen when the AAR state is ${mockState.type}`, () => {
      jest
        .spyOn(SELECTORS, "currentAarFlowData")
        .mockImplementation(_state => mockState);
      expect(mockReplace).not.toHaveBeenCalled();
      renderScreen();

      if (shouldNavigateToRetry) {
        expect(mockReplace).toHaveBeenCalledTimes(1);
      } else {
        expect(mockReplace).not.toHaveBeenCalled();
      }
    });

    it(`should never call any non-replace navigation action when type is "${mockState.type}"`, () => {
      jest
        .spyOn(SELECTORS, "currentAarFlowData")
        .mockImplementation(_state => mockState);

      renderScreen();

      expect(mockShouldNeverCall).not.toHaveBeenCalled();
    });
  });
});

const renderScreen = () => {
  const baseState = appReducer(undefined, applicationChangeState("active"));
  const globalState = {
    ...baseState
  } as GlobalState;
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <SendAarErrorScreen />,
    PN_ROUTES.SEND_AAR_ERROR,
    {},
    createStore(appReducer, globalState as any)
  );
};
