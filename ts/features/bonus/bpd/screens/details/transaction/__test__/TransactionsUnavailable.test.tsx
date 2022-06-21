import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import * as React from "react";

import { Store } from "redux";
import configureMockStore from "redux-mock-store";
import { ToolEnum } from "../../../../../../../../definitions/content/AssistanceToolConfig";
import { BackendStatus } from "../../../../../../../../definitions/content/BackendStatus";
import { Config } from "../../../../../../../../definitions/content/Config";
import I18n from "../../../../../../../i18n";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../../../utils/testWrapper";
import BPD_ROUTES from "../../../../navigation/routes";
import TransactionsUnavailable from "../TransactionsUnavailable";

jest.mock("../../../../../../../store/reducers/navigation", () => ({
  currentRouteSelector: jest.fn()
}));

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
      authentication: {
        kind: "LoggedOutWithoutIdp",
        reason: "NOT_LOGGED_IN"
      },
      backendStatus: {
        status: O.some({
          config: {
            assistanceTool: { tool: ToolEnum.none },
            cgn: { enabled: true },
            fims: { enabled: true }
          } as Config
        } as BackendStatus)
      },
      profile: pot.some({ is_email_validated: true })
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
  renderScreenFakeNavRedux<GlobalState>(
    () => <TransactionsUnavailable />,
    BPD_ROUTES.TRANSACTIONS,
    {},
    store
  );
