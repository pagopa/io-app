import * as React from "react";
import configureMockStore from "redux-mock-store";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { GlobalState } from "../../../../store/reducers/types";
import { FCI_ROUTES } from "../../navigation/routes";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import FciDataSharingScreen from "../valid/FciDataSharingScreen";
import I18n from "../../../../i18n";
import {
  profileEmailSelector,
  profileFiscalCodeSelector,
  profileNameSelector,
  profileSelector
} from "../../../../store/reducers/profile";
import { capitalize } from "../../../../utils/strings";
import mockedProfile from "../../../../__mocks__/initializedProfile";

describe("Test FciDataSharing screen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  it("should render the screen correctly", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const { component } = renderComponent(globalState);
    expect(component).toBeTruthy();
  });
  it("should render the screen with the right title", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const { component } = renderComponent({
      ...globalState,
      profile: pot.some(mockedProfile)
    });
    expect(component).toBeTruthy();
    expect(component).not.toBeNull();
    expect(
      component.queryByText(I18n.t("features.fci.shareDataScreen.content"))
    ).not.toBeNull();
  });
  it("should render the list of user data", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const { component } = renderComponent({
      ...globalState,
      profile: pot.some(mockedProfile)
    });
    expect(component).toBeTruthy();
    expect(
      component.getByTestId("FciDataSharingScreenListTestID")
    ).not.toBeNull();
  });
  it("should render name with the right title", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const { component, store } = renderComponent({
      ...globalState,
      profile: pot.some(mockedProfile)
    });

    expect(component).not.toBeNull();
    const nameSurname = profileNameSelector(store.getState());
    const listItemComponent = component.queryByTestId(
      "FciDataSharingScreenNameTestID"
    );
    expect(nameSurname).not.toBeNull();
    expect(listItemComponent).not.toBeNull();
    expect(
      component.getByText(I18n.t("features.fci.shareDataScreen.name"))
    ).not.toBeNull();
  });
  it("should render family name with the right title", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const { component, store } = renderComponent({
      ...globalState,
      profile: pot.some(mockedProfile)
    });
    expect(component).not.toBeNull();
    const profile = profileSelector(store.getState());
    const familyName = pot.getOrElse(
      pot.map(profile, p => capitalize(p.family_name)),
      undefined
    );
    const listItemComponent = component.queryByTestId(
      "FciDataSharingScreenFamilyNameTestID"
    );
    expect(listItemComponent).not.toBeNull();
    expect(familyName).not.toBeNull();
    expect(
      component.getByText(I18n.t("features.fci.shareDataScreen.familyName"))
    ).not.toBeNull();
  });
  it("should render date of birth with the right title", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const { component, store } = renderComponent({
      ...globalState,
      profile: pot.some({
        ...mockedProfile,
        date_of_birth: new Date("1990-01-01")
      })
    });
    expect(component).not.toBeNull();
    const profile = profileSelector(store.getState());
    const birthDate = pot.getOrElse(
      pot.map(profile, p => p.date_of_birth),
      undefined
    );
    const listItemComponent = component.queryByTestId(
      "FciDataSharingScreenBirthDateTestID"
    );

    expect(listItemComponent).not.toBeNull();
    expect(birthDate).not.toBeNull();
    expect(
      component.getByText(I18n.t("features.fci.shareDataScreen.birthDate"))
    ).not.toBeNull();
  });
  it("should render fiscal code with the right title", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const { component, store } = renderComponent({
      ...globalState,
      profile: pot.some(mockedProfile)
    });
    expect(component).not.toBeNull();
    const fiscalCode = profileFiscalCodeSelector(store.getState());
    const listItemComponent = component.queryByTestId(
      "FciDataSharingScreenFiscalCodeTestID"
    );
    expect(fiscalCode).not.toBeNull();
    expect(listItemComponent).not.toBeNull();
    expect(
      component.getByText(I18n.t("profile.fiscalCode.fiscalCode"))
    ).not.toBeNull();
  });
  it("should render user email with the right title", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const { component, store } = renderComponent({
      ...globalState,
      profile: pot.some(mockedProfile)
    });
    expect(component).not.toBeNull();
    const email = profileEmailSelector(store.getState());
    const listItemComponent = component.queryByTestId(
      "FciDataSharingScreenEmailTestID"
    );
    if (O.isSome(email)) {
      expect(listItemComponent).not.toBeNull();
      expect(
        component.getByText(I18n.t("profile.data.list.email"))
      ).not.toBeNull();
    } else {
      expect(listItemComponent).toBeNull();
    }
  });
  it("should render alert container", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const { component } = renderComponent({
      ...globalState,
      profile: pot.some(mockedProfile)
    });
    expect(component).not.toBeNull();
    expect(
      component.getByTestId("FciDataSharingScreenAlertTextTestID")
    ).not.toBeNull();
  });
});

const renderComponent = (state: GlobalState) => {
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...state
  } as GlobalState);

  return {
    component: renderScreenFakeNavRedux<GlobalState>(
      () => <FciDataSharingScreen />,
      FCI_ROUTES.USER_DATA_SHARE,
      {},
      store
    ),
    store
  };
};
