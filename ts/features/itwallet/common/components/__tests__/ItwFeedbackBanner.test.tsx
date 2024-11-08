import configureMockStore from "redux-mock-store";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { itwShouldRenderFeedbackBanner } from "../../store/selectors";
import { ItwFeedbackBanner } from "../ItwFeedbackBanner";

type JestMock = ReturnType<typeof jest.fn>;

jest.mock("../../store/selectors", () => ({
  isItwTrialActiveSelector: jest.fn()
}));

describe("ItwFeedbackBanner", () => {
  it("should match the snapshot", () => {
    const component = renderComponent();
    expect(component).toMatchSnapshot();
  });
});

const renderComponent = (shouldRender: boolean = true) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  (itwShouldRenderFeedbackBanner as unknown as JestMock).mockReturnValue(
    shouldRender
  );

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ItwFeedbackBanner,
    ROUTES.WALLET_HOME,
    {},
    store
  );
};
