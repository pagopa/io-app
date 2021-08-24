import { render } from "@testing-library/react-native";
import * as React from "react";
import { Provider } from "react-redux";
import * as pot from "italia-ts-commons/lib/pot";
import { FiscalCode, NonEmptyString } from "italia-ts-commons/lib/strings";
import configureMockStore from "redux-mock-store";
import { Card } from "../../../../../../../definitions/cgn/Card";
import { StatusEnum as CgnActivatedStatusEnum } from "../../../../../../../definitions/cgn/CardActivated";
import {
  CardRevoked,
  StatusEnum as CgnRevokedStatusEnum
} from "../../../../../../../definitions/cgn/CardRevoked";
import { StatusEnum as CgnExpiredStatusEnum } from "../../../../../../../definitions/cgn/CardExpired";
import { StatusEnum as CgnPendingStatusEnum } from "../../../../../../../definitions/cgn/CardPending";
import CgnCardComponent from "../CgnCardComponent";
import { GlobalState } from "../../../../../../store/reducers/types";
import { appReducer } from "../../../../../../store/reducers";
import { profileLoadSuccess } from "../../../../../../store/actions/profile";
import { InitializedProfile } from "../../../../../../../definitions/backend/InitializedProfile";
import { profileNameSurnameSelector } from "../../../../../../store/reducers/profile";
import { EmailAddress } from "../../../../../../../definitions/backend/EmailAddress";
import { PreferredLanguages } from "../../../../../../../definitions/backend/PreferredLanguages";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { ServicesPreferencesModeEnum } from "../../../../../../../definitions/backend/ServicesPreferencesMode";

const mockedProfile: InitializedProfile = {
  accepted_tos_version: 2.1,
  service_preferences_settings: {
    mode: ServicesPreferencesModeEnum.AUTO
  },
  email: "mario.rossi@email.it" as EmailAddress,
  family_name: "Rossi",
  has_profile: true,
  is_inbox_enabled: true,
  is_email_enabled: true,
  is_email_validated: true,
  is_webhook_enabled: true,
  name: "Mario",
  spid_email: "mario.rossi@spid-email.it" as EmailAddress,
  spid_mobile_phone: "555555555" as NonEmptyString,
  version: 2,
  date_of_birth: new Date(1991, 0, 6),
  fiscal_code: "TAMMRA80A41H501I" as FiscalCode,
  preferred_languages: ["it_IT"] as PreferredLanguages
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

  const nameSurname = component.queryByTestId("profile-name-surname");
  if (pot.isSome(store.getState().profile)) {
    expect(nameSurname).not.toBeNull();
    expect(nameSurname).toHaveTextContent(
      profileNameSurnameSelector(store.getState()) ?? ""
    );
  } else {
    expect(nameSurname).toBeNull();
  }
};

describe("CgnCardComponent", () => {
  const globalState = appReducer(undefined, profileLoadSuccess(mockedProfile));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState
  } as GlobalState);

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

  it("No profile", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const mockStore = configureMockStore<GlobalState>();
    const storeNoProfile: ReturnType<typeof mockStore> = mockStore({
      ...globalState
    } as GlobalState);
    baseCardTestCase(storeNoProfile, cgnStatusActivated);
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
