import { render } from "@testing-library/react-native";
import * as React from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import * as pot from "italia-ts-commons/lib/pot";
import { Card } from "../../../../../../../definitions/cgn/Card";
import { StatusEnum as CgnActivatedStatusEnum } from "../../../../../../../definitions/cgn/CardActivated";
import {
  CardRevoked,
  StatusEnum as CgnRevokedStatusEnum
} from "../../../../../../../definitions/cgn/CardRevoked";
import { StatusEnum as CgnExpiredStatusEnum } from "../../../../../../../definitions/cgn/CardExpired";
import { StatusEnum as CgnPendingStatusEnum } from "../../../../../../../definitions/cgn/CardPending";
import CgnCardComponent from "../CgnCardComponent";
import I18n from "../../../../../../i18n";
import { localeDateFormat } from "../../../../../../utils/locale";

const mockedProfile = {
  accepted_tos_version: 2.1,
  email: "mario.rossi@email.it",
  family_name: "Rossi",
  has_profile: true,
  is_inbox_enabled: true,
  is_email_enabled: true,
  is_email_validated: true,
  is_webhook_enabled: true,
  name: "Mario",
  spid_email: "mario.rossi@spid-email.it",
  spid_mobile_phone: 555555555,
  version: 2,
  date_of_birth: new Date(1991, 0, 6).toISOString(),
  fiscal_code: "TAMMRA80A41H501I",
  preferred_languages: ["it_IT"]
};

const cgnStatusActivated: Card = {
  status: CgnActivatedStatusEnum.ACTIVATED,
  activation_date: new Date("2020-03-04"),
  expiration_date: new Date("2037-02-20")
};

const cgnStatusRevoked: Card = {
  status: CgnRevokedStatusEnum.REVOKED,
  revocation_date: new Date("2030-02-20"),
  activation_date: new Date("2020-03-04"),
  expiration_date: new Date("2037-02-20"),
  revocation_reason: "A reason to revoke" as CardRevoked["revocation_reason"]
};

const cgnStatusExpired: Card = {
  status: CgnExpiredStatusEnum.EXPIRED,
  activation_date: new Date("2020-03-04"),
  expiration_date: new Date("2037-02-20")
};

const cgnStatusPending: Card = {
  status: CgnPendingStatusEnum.PENDING
};

const baseCardTestCase = (store: any, card: Card) => {
  const component = getComponent(store, card);

  expect(component).not.toBeNull();
  const webView = component.queryByTestId("background-webview");
  expect(webView).not.toBeNull();

  const validityDate = component.queryByTestId("validity-date");
  expect(validityDate).not.toBeNull();
  expect(validityDate).toHaveTextContent(
    `${I18n.t("cardComponent.validUntil")} ${localeDateFormat(
      cgnStatusActivated.expiration_date,
      I18n.t("global.dateFormats.shortFormat")
    )}`
  );
};

describe("CgnCardComponent", () => {
  const mockStore = configureMockStore();

  const store = mockStore({ profile: pot.some(mockedProfile) });

  it("Activated card", () => {
    baseCardTestCase(store, cgnStatusActivated);
  });

  it("Revoked card", () => {
    baseCardTestCase(store, cgnStatusRevoked);
  });

  it("Expired card", () => {
    baseCardTestCase(store, cgnStatusExpired);
  });

  it("Pending card", () => {
    const component = getComponent(store, cgnStatusPending);

    expect(component).not.toBeNull();
    const webView = component.queryByTestId("background-webview");
    expect(webView).not.toBeNull();

    const validityDate = component.queryByTestId("validity-date");
    expect(validityDate).toBeNull();
  });
});

const getComponent = (store: any, card: Card) => {
  const onLoadEnd = jest.fn();

  return render(
    <Provider store={store}>
      <CgnCardComponent cgnDetails={card} onCardLoadEnd={onLoadEnd} />
    </Provider>
  );
};
