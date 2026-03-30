import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { SETTINGS_ROUTES } from "../../../common/navigation/routes";
import DownloadProfileDataScreen from "../DownloadProfileDataScreen";
import * as hooks from "../../../../../store/hooks";
import * as selectors from "../../../common/store/selectors/userDataProcessing";
import { upsertUserDataProcessing } from "../../../common/store/actions/userDataProcessing";
import { UserDataProcessingChoiceEnum } from "../../../../../../definitions/backend/UserDataProcessingChoice";

jest.mock("../../../../../store/hooks", () => ({
  useIODispatch: jest.fn(),
  useIOSelector: jest.fn(),
  useIOStore: jest.fn(() => ({ getState: jest.fn() }))
}));

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock("../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack
  })
}));

describe("DownloadProfileDataScreen", () => {
  const dispatchMock = jest.fn();

  const mockUserDataProcessing = (downloadValue: any = pot.none) => {
    (hooks.useIOSelector as jest.Mock).mockImplementation(selector => {
      if (selector === selectors.userDataProcessingSelector) {
        return {
          DOWNLOAD: downloadValue,
          DELETE: pot.none
        };
      }
      return null;
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (hooks.useIODispatch as jest.Mock).mockReturnValue(dispatchMock);
  });

  it("should render correctly", () => {
    mockUserDataProcessing();
    const { getByTestId } = renderComponent();
    expect(getByTestId("share-data-component-title")).toBeTruthy();
  });

  it("should dispatch upsertUserDataProcessing.request on CTA press", async () => {
    mockUserDataProcessing();
    const { getByTestId } = renderComponent();
    fireEvent.press(getByTestId("export-data-download-button"));
    expect(dispatchMock).toHaveBeenCalledWith(
      upsertUserDataProcessing.request(UserDataProcessingChoiceEnum.DOWNLOAD)
    );
  });

  it("should contain a properly formatted markdown link for privacy policy", () => {
    mockUserDataProcessing();
    const { getByText } = renderComponent();
    const markdownLinkPattern = new RegExp(`\\[.+\\]\\(privacy://policy\\)`);
    expect(getByText(markdownLinkPattern)).toBeTruthy();
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  return renderScreenWithNavigationStoreContext(
    DownloadProfileDataScreen,
    SETTINGS_ROUTES.PROFILE_DOWNLOAD_DATA,
    {},
    store
  );
};
