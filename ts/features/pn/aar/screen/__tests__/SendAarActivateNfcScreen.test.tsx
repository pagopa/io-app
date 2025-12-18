import { createStore } from "redux";
import { Alert } from "react-native";
import { act, fireEvent } from "@testing-library/react-native";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import PN_ROUTES from "../../../navigation/routes";
import {
  SendAarActivateNfcScreen,
  SendAarActivateNfcScreenProps
} from "../SendAarActivateNfcScreen";
import { sendAarMockStates } from "../../utils/testUtils";
import { sendAARFlowStates } from "../../utils/stateUtils";
import * as AAR_SELECTORS from "../../store/selectors";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";

const mockReplace = jest.fn();
const mockTerminateFlow = jest.fn();

jest.mock("i18next", () => ({
  t: (path: string) => path
}));

jest.mock("../../hooks/useSendAarFlowManager", () => ({
  useSendAarFlowManager: () => ({
    terminateFlow: mockTerminateFlow
  })
}));

describe("SendAarActivateNfcScreen", () => {
  afterEach(jest.clearAllMocks);

  it("should match the snapshot", () => {
    const component = renderComponent();

    expect(component.toJSON()).toMatchSnapshot();
  });

  sendAarMockStates.forEach(aarState => {
    const isCieScanning = aarState.type === sendAARFlowStates.cieScanning;

    it(`${
      isCieScanning ? "should" : "should not"
    } invoke "navigation.replace" for state.type = "${aarState.type}"`, () => {
      jest.spyOn(AAR_SELECTORS, "currentAARFlowData").mockReturnValue(aarState);
      const spyOnAlert = jest.spyOn(Alert, "alert");

      renderComponent();

      if (isCieScanning) {
        const { type: _, ...params } = aarState;

        expect(mockReplace).toHaveBeenCalledTimes(1);
        expect(mockReplace).toHaveBeenCalledWith(
          MESSAGES_ROUTES.MESSAGES_NAVIGATOR,
          {
            screen: PN_ROUTES.MAIN,
            params: {
              screen: PN_ROUTES.SEND_AAR_CIE_CARD_READING,
              params
            }
          }
        );
      } else {
        expect(mockReplace).not.toHaveBeenCalled();
      }
      expect(spyOnAlert).not.toHaveBeenCalled();
    });
  });

  it("should invoke the Alert on close press", () => {
    const spyOnAlert = jest.spyOn(Alert, "alert");

    const { getByTestId } = renderComponent();

    const closeAction = getByTestId("closeActionID");

    act(() => {
      fireEvent.press(closeAction);
    });

    expect(spyOnAlert).toHaveBeenCalledTimes(1);
    expect(spyOnAlert).toHaveBeenCalledWith(
      "features.pn.aar.flow.androidNfcActivation.alertOnClose.title",
      "features.pn.aar.flow.androidNfcActivation.alertOnClose.message",
      [
        {
          text: "features.pn.aar.flow.androidNfcActivation.alertOnClose.confirm",
          style: "destructive",
          onPress: mockTerminateFlow
        },
        {
          text: "features.pn.aar.flow.androidNfcActivation.alertOnClose.cancel"
        }
      ]
    );

    const terminateFlowAction = spyOnAlert.mock.calls[0][2]![0];

    expect(mockTerminateFlow).not.toHaveBeenCalled();

    act(() => {
      terminateFlowAction.onPress!();
    });

    expect(mockTerminateFlow).toHaveBeenCalledTimes(1);
  });
});

function renderComponent() {
  const baseState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, baseState as any);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ({ navigation, route }: SendAarActivateNfcScreenProps) => (
      <SendAarActivateNfcScreen
        route={route}
        navigation={{ ...navigation, replace: mockReplace }}
      />
    ),
    PN_ROUTES.SEND_AAR_NFC_ACTIVATION,
    {},
    store
  );
}
