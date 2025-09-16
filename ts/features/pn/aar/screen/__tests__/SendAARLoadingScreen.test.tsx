import { render } from "@testing-library/react-native";
import * as hooks from "../../../../../store/hooks";
import { setAarFlowState } from "../../store/actions";
import { sendAARFlowStates } from "../../store/reducers";
import { SendAARLoadingScreen } from "../SendAARLoadingScreen";

jest.mock("../store/actions", () => ({
  setAarFlowState: jest.fn().mockReturnValue({ type: "SET_AAR_FLOW_STATE" })
}));

describe("SendAARLoadingScreen", () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(hooks, "useIODispatch").mockReturnValue(mockDispatch);
  });

  it("should render LoadingScreenContent", () => {
    jest.spyOn(hooks, "useIOSelector").mockReturnValue({ type: "any" });

    const { toJSON } = render(<SendAARLoadingScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it("should dispatch setAarFlowState with fetchingQRData when flowState is displayingAARToS", () => {
    const qrCode =
      "https://cittadini.notifichedigitali.it/io?aar=MDAwMDAwMDAwMDAwMDAwMDAwMDAwMVNFTkRfUEYtMTU4ODM3ZDItMWI4OS00NGYxLWFhMjQtOGVhOTEzZjkyZGI0X2NiYzk2YjdjLTI0MmUtNGIzZi1hZGYwLTE5NGJmNjY4ZGJhNw==";

    jest.spyOn(hooks, "useIOSelector").mockReturnValue({
      type: sendAARFlowStates.displayingAARToS,
      qrCode
    });

    render(<SendAARLoadingScreen />);

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(setAarFlowState).toHaveBeenCalledWith({
      type: sendAARFlowStates.fetchingQRData,
      qrCode
    });
    expect(mockDispatch).toHaveBeenCalledWith({ type: "SET_AAR_FLOW_STATE" });
  });

  it("should NOT dispatch setAarFlowState when flowState is different", () => {
    jest.spyOn(hooks, "useIOSelector").mockReturnValue({
      type: sendAARFlowStates.fetchingQRData,
      qrCode:
        "https://cittadini.notifichedigitali.it/io?aar=MDAwMDAwMDAwMDAwMDAwMDAwMDAwMVNFTkRfUEYtMTU4ODM3ZDItMWI4OS00NGYxLWFhMjQtOGVhOTEzZjkyZGI0X2NiYzk2YjdjLTI0MmUtNGIzZi1hZGYwLTE5NGJmNjY4ZGJhNw=="
    });

    render(<SendAARLoadingScreen />);

    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
