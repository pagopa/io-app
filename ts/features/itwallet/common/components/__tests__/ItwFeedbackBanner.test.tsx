import configureMockStore from "redux-mock-store";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as selectors from "../../store/selectors";
import { ItwFeedbackBanner } from "../ItwFeedbackBanner";
import { mockAccessibilityInfo } from "../../../../../utils/testAccessibility";

describe("ItwFeedbackBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    mockAccessibilityInfo();
  });

  it("should match the snapshot", () => {
    jest
      .spyOn(selectors, "itwShouldRenderFeedbackBannerSelector")
      .mockReturnValue(true);

    const component = renderComponent();
    expect(component).toMatchSnapshot();
  });

  it("should not render", () => {
    jest
      .spyOn(selectors, "itwShouldRenderFeedbackBannerSelector")
      .mockReturnValue(false);

    const { queryByTestId } = renderComponent();
    expect(queryByTestId("itwFeedbackBannerTestID")).toBeNull();
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ItwFeedbackBanner,
    ROUTES.WALLET_HOME,
    {},
    store
  );
};
