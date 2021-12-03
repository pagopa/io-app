import * as React from "react";
import { NavigationParams } from "react-navigation";
import { Store } from "redux";
import configureMockStore from "redux-mock-store";
import { some } from "fp-ts/lib/Option";
import I18n from "../../../../../../../i18n";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../../../utils/testWrapper";
import BPD_ROUTES from "../../../../navigation/routes";
import TransactionsUnavailable from "../TransactionsUnavailable";

describe("TransactionsUnavailable component", () => {
  const mockStore = configureMockStore();
  // eslint-disable-next-line functional/no-let
  let store: ReturnType<typeof mockStore>;

  beforeEach(() => {
    jest.useFakeTimers();
    store = mockStore({
      search: { isSearchEnabled: false },
      persistedPreferences: { isPagoPATestEnabled: false },
      network: { isConnected: true },
      instabug: { unreadMessages: 0 },
      authentication: {
        kind: "LoggedOutWithoutIdp",
        reason: "NOT_LOGGED_IN"
      },
      backendStatus: {
        status: some({ config: { zendesk: { active: false } } })
      }
    });
  });

  it("should show the payment-unavailable-icon.png", () => {
    const component = getComponent(store);
    const rasterImageComponent = component.queryByTestId("rasterImage");
    const paymentUnavailableIconPath =
      "../../../img/wallet/errors/payment-unavailable-icon.png";

    expect(rasterImageComponent).toHaveProp("source", {
      testUri: paymentUnavailableIconPath
    });
  });
  it("should use the right string as header, title and body", () => {
    const component = getComponent(store);
    const headerTitle = component.getByText(
      I18n.t("bonus.bpd.details.transaction.goToButton")
    );
    const title = component.getByText(
      I18n.t("bonus.bpd.details.transaction.error.title")
    );
    const body = component.getByText(
      I18n.t("bonus.bpd.details.transaction.error.body")
    );

    expect(headerTitle).not.toBeEmpty();
    expect(title).not.toBeEmpty();
    expect(body).not.toBeEmpty();
  });
});
const getComponent = (store: Store) =>
  renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    () => <TransactionsUnavailable />,
    BPD_ROUTES.TRANSACTIONS,
    {},
    store
  );
