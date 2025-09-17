import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import * as hooks from "../../../../../store/hooks";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import PN_ROUTES from "../../../navigation/routes";
import { setAarFlowState } from "../../store/actions";
import { sendAARFlowStates } from "../../store/reducers";
import { SendAARTosComponent } from "../SendAARTosComponent";

jest.mock("../../../../../store/hooks");

const qrCodeMock = "TEST";
describe("SendAARTosComponent", () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (hooks.useIODispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  it("dispatches the correct action when the button is pressed", () => {
    const { getByTestId } = renderComponent(qrCodeMock);
    const button = getByTestId("primary-button");
    fireEvent.press(button);

    expect(mockDispatch).toHaveBeenCalledWith(
      setAarFlowState({
        type: sendAARFlowStates.fetchingQRData,
        qrCode: qrCodeMock
      })
    );
  });
  it("should match snapshot", () => {
    const { toJSON } = renderComponent(qrCodeMock);
    expect(toJSON()).toMatchSnapshot();
  });
});
const renderComponent = (qr: string) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <SendAARTosComponent qrCode={qr} />,
    PN_ROUTES.QR_SCAN_FLOW,
    {},
    createStore(appReducer, globalState as any)
  );
};
