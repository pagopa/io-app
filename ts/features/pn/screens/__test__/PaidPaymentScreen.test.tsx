import { createStore } from "redux";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../store/actions/persistedPreferences";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import PN_ROUTES from "../../navigation/routes";
import { PaidPaymentScreen } from "../PaidPaymentScreen";
import { GlobalState } from "../../../../store/reducers/types";

describe("PaidPaymentScreen", () => {
  it("should match snapshot", () => {
    const screen = renderScreen();
    expect(screen.toJSON()).toMatchSnapshot();
  });
});

const renderScreen = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const designSystemState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const store = createStore(appReducer, designSystemState as any);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    PaidPaymentScreen,
    PN_ROUTES.CANCELLED_MESSAGE_PAID_PAYMENT,
    { noticeCode: "012345678912345670", creditorTaxId: "01234567890" },
    store
  );
};
