import { fireEvent, render } from "@testing-library/react-native";
import * as hooks from "../../../../../store/hooks";
import { setAarFlowState } from "../../store/actions";
import { sendAARFlowStates } from "../../store/reducers";
import { SendAARTosComponent } from "../SendAARTosComponent";

jest.mock("../../../../../store/hooks");

describe("SendAARTosComponent", () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (hooks.useIODispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  it("dispatches the correct action when the button is pressed", () => {
    const qrCodeValue =
      "https://cittadini.notifichedigitali.it/io?aar=MDAwMDAwMDAwMDAwMDAwMDAwMDAwMVNFTkRfUEYtMTU4ODM3ZDItMWI4OS00NGYxLWFhMjQtOGVhOTEzZjkyZGI0X2NiYzk2YjdjLTI0MmUtNGIzZi1hZGYwLTE5NGJmNjY4ZGJhNw==";
    const { getByTestId } = render(
      <SendAARTosComponent qrCode={qrCodeValue} />
    );

    const button = getByTestId("primary-button");
    fireEvent.press(button);

    expect(mockDispatch).toHaveBeenCalledWith(
      setAarFlowState({
        type: sendAARFlowStates.fetchingQRData,
        qrCode: qrCodeValue
      })
    );
  });
});
