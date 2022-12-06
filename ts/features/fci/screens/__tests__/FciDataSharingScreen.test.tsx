import * as React from "react";
import configureMockStore from "redux-mock-store";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { GlobalState } from "../../../../store/reducers/types";
import { FCI_ROUTES } from "../../navigation/routes";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import FciDataSharingScreen from "../valid/FciDataSharingScreen";
import I18n from "../../../../i18n";
import {
  profileFiscalCodeSelector,
  profileNameSelector,
  profileSelector
} from "../../../../store/reducers/profile";
import { capitalize } from "../../../../utils/strings";

describe("Test FciDataSharing screen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  it("should render the screen correctly", () => {
    const { component } = renderComponent();
    expect(component).toBeTruthy();
  });
  it("should render the screen with the right title", () => {
    const { component } = renderComponent();
    expect(component).toBeTruthy();
    expect(component).not.toBeNull();
    expect(
      component.queryByText(I18n.t("features.fci.shareDataScreen.content"))
    ).not.toBeNull();
  });
  it("should render the list of user data", () => {
    const { component } = renderComponent();
    expect(component).toBeTruthy();
    expect(
      component.getByTestId("FciDataSharingScreenListTestID")
    ).not.toBeNull();
  });
  it("should render name with the right title", () => {
    const { component, store } = renderComponent();

    expect(component).not.toBeNull();
    const nameSurname = profileNameSelector(store.getState());
    const listItemComponent = component.queryByTestId(
      "FciDataSharingScreenNameTestID"
    );
    if (nameSurname) {
      expect(listItemComponent).not.toBeNull();
      expect(listItemComponent).toHaveTextContent(
        I18n.t("features.fci.shareDataScreen.name")
      );
      expect(listItemComponent).toHaveTextContent(nameSurname);
    } else {
      expect(listItemComponent).toBeNull();
    }
  });
  it("should render family name with the right title", () => {
    const { component, store } = renderComponent();

    expect(component).not.toBeNull();
    const profile = profileSelector(store.getState());
    const familyName = pot.getOrElse(
      pot.map(profile, p => capitalize(p.family_name)),
      undefined
    );
    const listItemComponent = component.queryByTestId(
      "FciDataSharingScreenFamilyNameTestID"
    );
    if (familyName) {
      expect(listItemComponent).not.toBeNull();
      expect(listItemComponent).toHaveTextContent(
        I18n.t("features.fci.shareDataScreen.familyName")
      );
      expect(listItemComponent).toHaveTextContent(familyName);
    } else {
      expect(listItemComponent).toBeNull();
    }
  });
  it("should render date of birth with the right title", () => {
    const { component, store } = renderComponent();

    expect(component).not.toBeNull();
    const profile = profileSelector(store.getState());
    const birthDate = pot.getOrElse(
      pot.map(profile, p => p.date_of_birth),
      undefined
    );
    const listItemComponent = component.queryByTestId(
      "FciDataSharingScreenBirthDateTestID"
    );
    if (birthDate) {
      expect(listItemComponent).not.toBeNull();
      expect(listItemComponent).toHaveTextContent(
        I18n.t("features.fci.shareDataScreen.birthDate")
      );
      expect(listItemComponent).toHaveTextContent(
        birthDate.toLocaleDateString()
      );
    } else {
      expect(listItemComponent).toBeNull();
    }
  });
  it("should render fiscal code with the right title", () => {
    const { component, store } = renderComponent();

    expect(component).not.toBeNull();
    const fiscalCode = profileFiscalCodeSelector(store.getState());

    const listItemComponent = component.queryByTestId(
      "FciDataSharingScreenFiscalCodeTestID"
    );
    if (fiscalCode) {
      expect(listItemComponent).not.toBeNull();
      expect(listItemComponent).toHaveTextContent(
        I18n.t("profile.fiscalCode.fiscalCode")
      );
      expect(listItemComponent).toHaveTextContent(fiscalCode);
    } else {
      expect(listItemComponent).toBeNull();
    }
  });
  it("should render alert container", () => {
    const { component } = renderComponent();
    expect(component).not.toBeNull();
    expect(
      component.getByTestId("FciDataSharingScreenAlertTextTestID")
    ).not.toBeNull();
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState
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
