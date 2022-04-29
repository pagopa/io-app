import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";

import { Action, createStore, Store } from "redux";
import { PrivativeServices } from "../../../../../../../../definitions/pagopa/privative/configuration/PrivativeServices";
import { PrivativeServiceStatusEnum } from "../../../../../../../../definitions/pagopa/privative/configuration/PrivativeServiceStatus";
import I18n from "../../../../../../../i18n";
import { applicationChangeState } from "../../../../../../../store/actions/application";
import { appReducer } from "../../../../../../../store/reducers";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../../../utils/testWrapper";
import WALLET_ONBOARDING_PRIVATIVE_ROUTES from "../../../navigation/routes";
import { loadPrivativeIssuers } from "../../../store/actions";
import ChoosePrivativeIssuerScreen from "../ChoosePrivativeIssuerScreen";

jest.mock("react-native-share", () => jest.fn());

const mockPrivativeIssuers: PrivativeServices = {
  "N&TS": {
    status: PrivativeServiceStatusEnum.enabled,
    issuers: [
      {
        id: "ESSEL",
        gdo: "Esselunga",
        loyalty: "Fìdaty Oro"
      },
      {
        id: "CONAD",
        gdo: "Conad",
        loyalty: "Carta Insieme Più"
      },
      {
        id: "COOP1",
        gdo: "Unicoop Firenze",
        loyalty: "Spesa IN"
      }
    ]
  }
};

describe("Test behaviour of the CoBadgeStartScreen", () => {
  jest.useFakeTimers();
  it("With the default state, the screen should render ChoosePrivativeIssuerScreen in loading state", () => {
    const { store, testComponent } = getInitChoosePrivativeIssuersScreen();
    // check default initial state
    expect(store.getState().wallet.onboarding.privative.privativeIssuers).toBe(
      pot.noneLoading
    );
    expect(
      testComponent.queryByTestId("LoadingErrorComponentLoading")
    ).toBeTruthy();
    expect(
      testComponent.queryByText(
        I18n.t("wallet.onboarding.privative.choosePrivativeIssuer.loading")
      )
    ).toBeTruthy();

    // the loading of the privative issuers fails
    store.dispatch(
      loadPrivativeIssuers.failure({
        kind: "generic",
        value: new Error()
      })
    );
    expect(
      testComponent.queryByTestId("LoadingErrorComponentError")
    ).toBeTruthy();
  });
  it("With a success after the loading phase, the screen should render ChoosePrivativeIssuerComponent", () => {
    const { store, testComponent } = getInitChoosePrivativeIssuersScreen();

    // the loading of the privative issuers fails
    store.dispatch(loadPrivativeIssuers.success(mockPrivativeIssuers));

    // Should render the ChoosePrivativeIssuerComponent
    expect(
      testComponent.queryByTestId("ChoosePrivativeIssuerComponent")
    ).toBeTruthy();
    expect(
      testComponent.queryByText(
        I18n.t("wallet.onboarding.privative.choosePrivativeIssuer.title")
      )
    ).toBeTruthy();
    expect(
      testComponent.queryByText(
        I18n.t("wallet.onboarding.privative.choosePrivativeIssuer.body")
      )
    ).toBeTruthy();
  });
});

const getInitChoosePrivativeIssuersScreen = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  const testComponent = renderPrivativeIssuersScreen(store);
  return { store, testComponent };
};

const renderPrivativeIssuersScreen = (store: Store<GlobalState, Action>) =>
  renderScreenFakeNavRedux<GlobalState>(
    () => <ChoosePrivativeIssuerScreen />,
    WALLET_ONBOARDING_PRIVATIVE_ROUTES.CHOOSE_ISSUER,
    {},
    store
  );
