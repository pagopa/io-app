import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../../store/actions/application";
import * as hooks from "../../../../../../store/hooks";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import PN_ROUTES from "../../../../navigation/routes";
import { setAarFlowState } from "../../../store/actions";
import { AARFlowState } from "../../../utils/stateUtils";
import { SendAARErrorComponent } from "../../errors/SendAARErrorComponent";

jest.mock("../../../../../store/hooks");

const mockPopToTop = jest.fn();

jest.mock("@react-navigation/native", () => {
  const navigationModule = jest.requireActual("@react-navigation/native");
  return {
    ...navigationModule,
    useNavigation: () => ({
      ...navigationModule.useNavigation(),
      popToTop: mockPopToTop
    })
  };
});

describe("SendAARErrorComponent", () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (hooks.useIODispatch as jest.Mock).mockReturnValue(mockDispatch);
    (hooks.useIOSelector as jest.Mock).mockReturnValue(undefined);
  });

  (
    [
      {
        type: "ko",
        previousState: {
          type: "fetchingQRData",
          qrCode: "TEST"
        },
        errorKind: "GENERIC"
      },
      {
        type: "ko",
        previousState: {
          type: "fetchingNotificationData",
          iun: "0001",
          fullNameDestinatario: "Mario Rossi"
        },
        errorKind: "GENERIC"
      }
    ] as ReadonlyArray<Extract<AARFlowState, { type: "ko" }>>
  ).forEach(state =>
    it(`dispatches the action with payload='${JSON.stringify(
      state
    )}' when the primary button is pressed`, () => {
      (hooks.useIOSelector as jest.Mock).mockReturnValue(state);

      const { getByTestId } = renderComponent();
      const button = getByTestId("primary-action");

      expect(mockDispatch).toHaveBeenCalledTimes(0);
      fireEvent.press(button);
      expect(mockDispatch).toHaveBeenCalledWith(
        setAarFlowState(state.previousState)
      );
    })
  );

  it("should match snapshot", () => {
    (hooks.useIOSelector as jest.Mock).mockReturnValue({
      type: "ko",
      previousState: {
        type: "fetchingQRData",
        qrCode: "TEST"
      }
    });

    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <SendAARErrorComponent />,
    PN_ROUTES.QR_SCAN_FLOW,
    {},
    createStore(appReducer, globalState as any)
  );
};
