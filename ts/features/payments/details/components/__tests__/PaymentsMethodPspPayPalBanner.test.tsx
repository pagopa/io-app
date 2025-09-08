import { render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import I18n from "i18next";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { PaymentsMethodPspPayPalBanner } from "../PaymentsMethodPspPayPalBanner";

const globalState = appReducer(undefined, applicationChangeState("active"));
const mockStore = configureMockStore<GlobalState>();
const store: ReturnType<typeof mockStore> = mockStore(globalState);

const renderComponent = (isWalletPayPalBannerClosed = false) => {
  const enrichedStore = {
    ...store,
    getState: () => ({
      ...store.getState(),
      features: {
        ...store.getState().features,
        payments: {
          ...store.getState().features.payments,
          details: {
            isWalletPayPalBannerClosed
          }
        }
      }
    })
  };
  return render(
    <Provider store={enrichedStore}>
      <PaymentsMethodPspPayPalBanner />
    </Provider>
  );
};

describe("PaymentsMethodPspPayPalBanner", () => {
  it("should render when banner has never been closed", () => {
    const { getByText } = renderComponent();
    expect(
      getByText(I18n.t("features.payments.details.payPal.banner.title"))
    ).toBeDefined();
  });

  it("should not render when banner has been closed", () => {
    const { queryByText } = renderComponent(true);
    expect(
      queryByText(I18n.t("features.payments.details.payPal.banner.title"))
    ).toBeNull();
  });
});
