import configureMockStore from "redux-mock-store";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import {
  ItwEngagementBanner,
  ItwEngagementBannerVariant
} from "../ItwEngagementBanner";

describe("ItwEngagementBanner", () => {
  it.each(["activation", "upgrade", "upgrade_empty", "upgrade_expiring"])(
    "should match the snapshot for %s variant",
    variant => {
      const component = renderComponent(variant as ItwEngagementBannerVariant);
      expect(component).toMatchSnapshot();
    }
  );
});

const renderComponent = (variant: ItwEngagementBannerVariant) => {
  const dummyHandler = jest.fn();
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwEngagementBanner
        variant={variant}
        onPress={dummyHandler}
        onClosePress={dummyHandler}
      />
    ),
    ROUTES.WALLET_HOME,
    {},
    store
  );
};
