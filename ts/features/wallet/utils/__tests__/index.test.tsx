import { Body } from "@pagopa/io-app-design-system";
import configureMockStore from "redux-mock-store";
import { withWalletCategoryFilter } from "..";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import * as selectors from "../../store/selectors";

describe("withWalletCategoryFilter", () => {
  it("should return null if the category filter does not match", () => {
    const WrappedComponent = () => (
      <Body testID="WrappedComponentTestID">Hello</Body>
    );
    const ComponentWithFilter = withWalletCategoryFilter(
      "itw",
      WrappedComponent
    );

    const globalState = appReducer(undefined, applicationChangeState("active"));

    const mockStore = configureMockStore<GlobalState>();
    const store: ReturnType<typeof mockStore> = mockStore(globalState);

    jest
      .spyOn(selectors, "shouldRenderWalletCategorySelector")
      .mockImplementation(() => false);

    const { queryByTestId } =
      renderScreenWithNavigationStoreContext<GlobalState>(
        () => <ComponentWithFilter />,
        ROUTES.WALLET_HOME,
        {},
        store
      );
    expect(queryByTestId("WrappedComponentTestID")).toBeNull();
  });
});
