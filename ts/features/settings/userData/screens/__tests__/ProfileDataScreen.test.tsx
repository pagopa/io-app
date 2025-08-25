import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { act, fireEvent } from "@testing-library/react-native";
import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import { PreloadedState, createStore } from "redux";
import I18n from "i18next";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import {
  profileEmailSelector,
  profileNameSurnameSelector
} from "../../../common/store/selectors";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import ProfileDataScreen from "../ProfileDataScreen";
import { EmailAddress } from "../../../../../../definitions/backend/EmailAddress";
import { profileLoadSuccess } from "../../../common/store/actions";
import { ServicesPreferencesModeEnum } from "../../../../../../definitions/backend/ServicesPreferencesMode";
import { SETTINGS_ROUTES } from "../../../common/navigation/routes";

const profileWithoutEmail = {
  is_inbox_enabled: true,
  is_email_enabled: true,
  is_webhook_enabled: true,
  is_email_already_taken: false,
  family_name: "Red",
  fiscal_code: "FiscalCode" as FiscalCode,
  has_profile: true,
  name: "Tom",
  service_preferences_settings: { mode: ServicesPreferencesModeEnum.AUTO },
  version: 1
};
const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      ...actualNav.useNavigation(),
      navigate: mockNavigate
    })
  };
});

describe("Test ProfileDataScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("should be not null", () => {
    const { component } = renderComponent();

    expect(component).not.toBeNull();
  });
  it("should render H1 component with title and H4 component with subtitle", () => {
    const { component } = renderComponent();

    expect(
      // With the new navbar we have two titles.
      // The second one is the larger one.
      // The first one is the smaller one that is shown when scrolling.
      component.queryAllByText(I18n.t("profile.data.title"))[1]
    ).not.toBeNull();
    expect(
      component.queryByText(I18n.t("profile.data.subtitle"))
    ).not.toBeNull();
  });
  it("should render ListItemComponent insert or edit email with the right title and subtitle", () => {
    const { component, store } = renderComponent();

    expect(component.queryByTestId("insert-or-edit-email")).not.toBeNull();
    expect(
      // With the new navbar we have two titles.
      // The second one is the larger one.
      // The first one is the smaller one that is shown when scrolling.
      component.queryAllByText(I18n.t("profile.data.title"))[1]
    ).not.toBeNull();
    expect(
      component.queryByText(
        pipe(
          profileEmailSelector(store.getState()),
          O.getOrElse(() => I18n.t("global.remoteStates.notAvailable"))
        )
      )
    ).not.toBeNull();
  });
  it("when press ListItemComponent insert or edit email, if user has email should navigate to EmailReadScreen else should navigate to EmailInsertScreen", () => {
    const { component } = renderComponent();

    const listItemComponent = component.getByTestId("insert-or-edit-email");
    expect(listItemComponent).not.toBeNull();
    fireEvent.press(listItemComponent);
  });
  it("should render ListItemComponent name and surname with the right title and subtitle", () => {
    const { component, store } = renderComponent();

    const nameSurname = profileNameSurnameSelector(store.getState());
    const listItemComponent = component.queryByTestId("name-surname");
    if (nameSurname) {
      expect(listItemComponent).not.toBeNull();
      expect(listItemComponent).toHaveTextContent(
        I18n.t("profile.data.list.nameSurname")
      );
      expect(listItemComponent).toHaveTextContent(nameSurname);
    } else {
      expect(listItemComponent).toBeNull();
    }
  });
  it("Should not navigate since profile has no email", () => {
    const { component, store } = renderComponent();
    act(() => {
      store.dispatch(profileLoadSuccess(profileWithoutEmail));
    });
    const { getByTestId } = component;
    const editEmailButton = getByTestId(/insert-or-edit-email-cta/);

    fireEvent.press(editEmailButton);

    expect(mockNavigate).not.toHaveBeenCalled();
  });
  it("Should navigate to the Insert Email Screen", () => {
    const { component, store } = renderComponent();
    act(() => {
      store.dispatch(
        profileLoadSuccess({
          ...profileWithoutEmail,
          email: "this@email.it" as EmailAddress
        })
      );
    });
    const { getByTestId } = component;
    const editEmailButton = getByTestId(/insert-or-edit-email-cta/);

    fireEvent.press(editEmailButton);

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(
      SETTINGS_ROUTES.PROFILE_NAVIGATOR,
      {
        screen: SETTINGS_ROUTES.INSERT_EMAIL_SCREEN,
        params: {
          isOnboarding: false
        }
      }
    );
  });
});

const renderComponent = () => {
  const globalState = appReducer(
    undefined,
    applicationChangeState("active")
  ) as unknown as PreloadedState<GlobalState>;
  const store = createStore(appReducer, globalState);

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      () => <ProfileDataScreen />,
      SETTINGS_ROUTES.PROFILE_DATA,
      {},
      store
    ),
    store
  };
};
