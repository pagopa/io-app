import * as pot from "@pagopa/ts-commons/lib/pot";
import { render } from "@testing-library/react-native";
import * as React from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { Card } from "../../../../../../../definitions/cgn/Card";
import { StatusEnum as CgnActivatedStatusEnum } from "../../../../../../../definitions/cgn/CardActivated";
import { StatusEnum as CgnExpiredStatusEnum } from "../../../../../../../definitions/cgn/CardExpired";
import { StatusEnum as CgnPendingStatusEnum } from "../../../../../../../definitions/cgn/CardPending";
import {
  CardRevoked,
  StatusEnum as CgnRevokedStatusEnum
} from "../../../../../../../definitions/cgn/CardRevoked";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { profileLoadSuccess } from "../../../../../../store/actions/profile";
import { appReducer } from "../../../../../../store/reducers";
import { profileNameSurnameSelector } from "../../../../../../store/reducers/profile";
import { GlobalState } from "../../../../../../store/reducers/types";
import mockedProfile from "../../../../../../__mocks__/initializedProfile";
import CgnCardComponent from "../CgnCardComponent";

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
