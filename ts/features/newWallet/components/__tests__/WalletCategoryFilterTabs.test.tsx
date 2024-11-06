import _ from "lodash";
import configureMockStore from "redux-mock-store";
import * as O from "fp-ts/lib/Option";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { WalletCategoryFilterTabs } from "../WalletCategoryFilterTabs";
import { ItwLifecycleState } from "../../../itwallet/lifecycle/store/reducers";

describe("WalletCategoryFilterTabs", () => {
  it("should not render the component when the wallet is not active", () => {
    const { queryByTestId } = renderComponent({
      isItwValid: false,
      isWalletEmpty: true
    });
    expect(queryByTestId("CategoryTabsContainerTestID")).toBeNull();
  });

  it("should not render the component when the wallet is empty", () => {
    const { queryByTestId } = renderComponent({
      isItwValid: true,
      isWalletEmpty: true
    });
    expect(queryByTestId("CategoryTabsContainerTestID")).toBeNull();
  });

  it("should render the component when the wallet is active and not empty", () => {
    const { queryByTestId } = renderComponent({
      isItwValid: true,
      isWalletEmpty: false
    });
    expect(queryByTestId("CategoryTabsContainerTestID")).not.toBeNull();
  });
});

const renderComponent = ({
  isItwValid,
  isWalletEmpty
}: {
  isItwValid: boolean;
  isWalletEmpty: boolean;
}) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(
    _.merge(undefined, globalState, {
      features: {
        itWallet: {
          ...(isItwValid && {
            issuance: {
              integrityKeyTag: O.some("key-tag")
            },
            credentials: {
              eid: O.some({ parsedCredential: {} }),
              credentials: isWalletEmpty
                ? []
                : [O.some({ parsedCredential: {} })]
            },
            lifecycle: ItwLifecycleState.ITW_LIFECYCLE_VALID
          })
        }
      }
    })
  );

  return renderScreenWithNavigationStoreContext<GlobalState>(
    WalletCategoryFilterTabs,
    ROUTES.WALLET_HOME,
    {},
    store
  );
};
