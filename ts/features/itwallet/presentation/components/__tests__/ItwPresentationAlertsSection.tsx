import MockDate from "mockdate";
import { format } from "date-fns";
import * as React from "react";
import { createStore } from "redux";
import I18n from "../../../../../i18n";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import {
  CredentialType,
  ItwStoredCredentialsMocks
} from "../../../common/utils/itwMocksUtils";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/provider";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwPresentationAlertsSection } from "../ItwPresentationAlertsSection";

describe("ItwPresentationAlertsSection", () => {
  beforeAll(() => {
    MockDate.set(new Date(2000, 0, 20, 23, 59));
  });

  afterAll(() => {
    MockDate.reset();
  });

  it("should pass the sanity check", () => {
    const actualDate = new Date();
    const expectedDate = new Date(2000, 0, 20, 23, 59);
    expect(actualDate).toEqual(expectedDate);
  });

  it("should render expired alert", () => {
    const { queryByTestId } = renderComponent(
      CredentialType.DRIVING_LICENSE,
      new Date(Date.now() - 1000)
    );

    expect(queryByTestId("itwExpiredBannerTestID")).not.toBeNull();
    expect(queryByTestId("itwExpiringBannerTestID")).toBeNull();
    expect(queryByTestId("itwMdlBannerTestID")).toBeNull();
  });

  it("should render expiring alert with correct number of days", () => {
    const { queryByTestId, queryByText } = renderComponent(
      CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
      new Date(2000, 0, 21, 0, 0)
    );

    expect(queryByTestId("itwExpiredBannerTestID")).toBeNull();
    expect(queryByTestId("itwExpiringBannerTestID")).not.toBeNull();
    expect(queryByTestId("itwMdlBannerTestID")).toBeNull();

    expect(
      queryByText(
        I18n.t("features.itWallet.presentation.alerts.expiring.content", {
          days: 1
        })
      )
    ).not.toBeNull();
  });

  it("should render MDL alert", () => {
    const { queryByTestId } = renderComponent(
      CredentialType.DRIVING_LICENSE,
      new Date(2000, 0, 19)
    );

    expect(queryByTestId("itwExpiredBannerTestID")).toBeNull();
    expect(queryByTestId("itwExpiringBannerTestID")).toBeNull();
    expect(queryByTestId("itwMdlBannerTestID")).not.toBeNull();
  });
});

const renderComponent = (credentialType: CredentialType, expireDate: Date) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwCredentialIssuanceMachineContext.Provider>
        <ItwPresentationAlertsSection
          credential={{
            ...ItwStoredCredentialsMocks.dc,
            credentialType,
            parsedCredential: {
              expiry_date: {
                name: "",
                value: format(expireDate, "YYYY-MM-DD")
              }
            }
          }}
        />
      </ItwCredentialIssuanceMachineContext.Provider>
    ),
    ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL,
    {},
    createStore(appReducer, globalState as any)
  );
};
