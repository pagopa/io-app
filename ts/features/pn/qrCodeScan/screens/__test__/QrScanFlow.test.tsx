import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as REDIRECT_SCREEN from "../../components/SendQrScanRedirectComponent";
import { SendQrScanFlow } from "../QrScanFlow";
import PN_ROUTES from "../../../navigation/routes";
import * as IONAV from "../../../../../navigation/params/AppParamsList";

type navType = ReturnType<(typeof IONAV)["useIONavigation"]>;

describe("SendQrScanFlow", () => {
  const mockAarUrl = "https://test-url.com";
  afterEach(() => {
    jest.clearAllMocks();
  });
  const mockPopToTop = jest.fn() as navType["popToTop"];
  beforeAll(() => {
    jest
      .spyOn(IONAV, "useIONavigation")
      .mockImplementation(() => ({ popToTop: mockPopToTop } as navType));
  });

  it("renders SendQrScanRedirectComponent with aarUrl from route params", () => {
    const mockComponent = jest.fn();
    jest
      .spyOn(REDIRECT_SCREEN, "SendQrScanRedirectComponent")
      .mockImplementation(({ aarUrl }) => {
        mockComponent(aarUrl);
        return <></>;
      });
    renderComponent(mockAarUrl);
    expect(mockComponent).toHaveBeenCalledWith(mockAarUrl);
    expect(mockComponent).toHaveBeenCalledTimes(1);
  });

  it("calls navigation.navigate when secondary action is pressed", () => {
    const { getByTestId } = renderComponent(mockAarUrl);
    const button = getByTestId("header-close");
    fireEvent(button, "press");
    expect(mockPopToTop).toHaveBeenCalledTimes(1);
  });
});
function renderComponent(aarUrl: string) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <SendQrScanFlow />,
    PN_ROUTES.QR_SCAN_FLOW,
    { aarUrl },
    createStore(appReducer, globalState as any)
  );
}
