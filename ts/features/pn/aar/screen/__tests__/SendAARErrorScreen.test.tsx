import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import PN_ROUTES from "../../../navigation/routes";
import * as ERROR_COMPONENT from "../../components/errors/SendAARErrorComponent";
import * as NOT_ADDRESSEE_COMPONENT from "../../components/errors/SendAARNotAddresseeComponent";
import { sendAARFlowStates } from "../../utils/stateUtils";
import { SendAARErrorScreen } from "../SendAARErrorScreen";
import { sendAarMockStates } from "../../utils/testUtils";
import * as SELECTORS from "../../store/selectors";
import * as ANALYTICS from "../../analytics";

jest.mock("../../components/errors/SendAARNotAddresseeComponent.tsx");
jest.mock("../../components/errors/SendAARErrorComponent.tsx");

describe("SendAARErrorScreen", () => {
  const componentMock = jest.fn();
  const notAddresseeComponentSpy = jest
    .spyOn(NOT_ADDRESSEE_COMPONENT, "SendAARNotAddresseeComponent")
    .mockImplementation(componentMock);
  const errorComponentSpy = jest
    .spyOn(ERROR_COMPONENT, "SendAARErrorComponent")
    .mockImplementation(componentMock);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the SendAARErrorComponent if flowType==='notAddresseeFinal'", () => {
    jest
      .spyOn(SELECTORS, "currentAARFlowStateType")
      .mockImplementation(_state => sendAARFlowStates.notAddresseeFinal);
    expect(notAddresseeComponentSpy).not.toHaveBeenCalled();
    renderScreen();
    expect(notAddresseeComponentSpy).toHaveBeenCalled();
  });

  it("should render the SendAARErrorComponent if flowType!=='notAddresseeFinal'", () => {
    jest
      .spyOn(SELECTORS, "currentAARFlowStateType")
      .mockImplementation(_state => sendAARFlowStates.ko);
    expect(errorComponentSpy).not.toHaveBeenCalled();
    renderScreen();
    expect(errorComponentSpy).toHaveBeenCalled();
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
