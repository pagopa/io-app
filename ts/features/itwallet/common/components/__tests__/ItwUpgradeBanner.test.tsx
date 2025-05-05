import configureMockStore from "redux-mock-store";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as preferencesSelectors from "../../store/selectors/preferences";
import { ItwAuthLevel } from "../../utils/itwTypesUtils";
import { ItwUpgradeBanner } from "../ItwUpgradeBanner";

describe("ItwUpgradeBanner", () => {
  it.each([
    [undefined, false],
    ["L2", true],
    ["L3", false]
  ] as ReadonlyArray<[ItwAuthLevel | undefined, boolean]>)(
    "should render %s",
    (authLevel, expected) => {
      jest
        .spyOn(preferencesSelectors, "itwAuthLevelSelector")
        .mockReturnValue(authLevel as ItwAuthLevel);
      jest
        .spyOn(preferencesSelectors, "itwIsL3EnabledSelector")
        .mockReturnValue(true);

      const { getByTestId } = renderComponent();

      if (expected) {
        expect(getByTestId("itwUpgradeBannerTestID")).toBeDefined();
      } else {
        expect(() => getByTestId("itwUpgradeBannerTestID")).toThrow();
      }
    }
  );
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ItwUpgradeBanner,
    ROUTES.WALLET_HOME,
    {},
    store
  );
};
