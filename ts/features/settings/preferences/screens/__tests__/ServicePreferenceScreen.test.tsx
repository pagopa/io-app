import { fireEvent, waitFor } from "@testing-library/react-native";
import { createStore } from "redux";
import * as pot from "@pagopa/ts-commons/lib/pot";
import I18n from "i18next";
import ServicesPreferenceScreen from "../ServicesPreferenceScreen";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { appReducer } from "../../../../../store/reducers";
import { SETTINGS_ROUTES } from "../../../common/navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { ServicesPreferencesModeEnum } from "../../../../../../definitions/backend/ServicesPreferencesMode";
import * as hooks from "../../../../../store/hooks";
import * as selectors from "../../../common/store/selectors";
import * as usePreviousHook from "../../../../../utils/hooks/usePrevious";
import { profileUpsert } from "../../../common/store/actions";

jest.mock("../../../../../utils/analytics", () => ({
  getFlowType: jest.fn(() => "mock-flow")
}));

jest.mock("../../../common/analytics", () => ({
  trackServiceConfiguration: jest.fn(),
  trackServiceConfigurationScreen: jest.fn()
}));

jest.mock("../../shared/hooks/useManualConfigBottomSheet", () => ({
  useManualConfigBottomSheet: jest.fn(() => ({
    present: jest.fn(),
    manualConfigBottomSheet: null
  }))
}));

const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
  hideAll: jest.fn()
};

jest.mock("@pagopa/io-app-design-system", () => {
  const actual = jest.requireActual("@pagopa/io-app-design-system");
  return {
    ...actual,
    useIOToast: () => mockToast
  };
});

describe("ServicesPreferenceScreen", () => {
  beforeEach(() => {
    jest.spyOn(hooks, "useIODispatch").mockReturnValue(jest.fn());
    jest.spyOn(hooks, "useIOStore").mockReturnValue({
      getState: () => ({})
    } as any);
  });

  it("should match snapshot", () => {
    const tree = renderComponent().toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("should render the screen", () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId("services-preference-screen")).toBeTruthy();
  });

  it("should show success toast on manual config change", async () => {
    jest.spyOn(selectors, "profileSelector").mockReturnValue(
      pot.some({
        service_preferences_settings: {
          mode: ServicesPreferencesModeEnum.MANUAL
        }
      } as any)
    );

    jest
      .spyOn(selectors, "profileServicePreferencesModeSelector")
      .mockReturnValue(ServicesPreferencesModeEnum.MANUAL);

    jest
      .spyOn(usePreviousHook, "usePrevious")
      .mockImplementationOnce(() =>
        pot.toUpdating(
          pot.some({
            service_preferences_settings: {
              mode: ServicesPreferencesModeEnum.AUTO
            }
          } as any),
          {
            service_preferences_settings: {
              mode: ServicesPreferencesModeEnum.AUTO
            }
          } as any
        )
      ) // prevProfile
      .mockImplementationOnce(() => ServicesPreferencesModeEnum.AUTO); // prevMode

    renderComponent();

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalled();
    });
  });
  it("should show error toast if profile update fails", async () => {
    jest
      .spyOn(selectors, "profileSelector")
      .mockReturnValue(pot.toError(pot.none, new Error("some error")));
    jest
      .spyOn(usePreviousHook, "usePrevious")
      .mockImplementationOnce(() => pot.some({}));

    renderComponent();

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        I18n.t("global.genericError")
      );
    });
  });

  it("should call trackServiceConfigurationScreen on first render", () => {
    const spy =
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require("../../../common/analytics").trackServiceConfigurationScreen;
    renderComponent();
    expect(spy).toHaveBeenCalledWith("mock-flow");
  });

  it("should show loading spinner if profile is loading", () => {
    jest
      .spyOn(selectors, "profileSelector")
      .mockReturnValue(pot.toLoading(pot.none));
    const { getByTestId } = renderComponent();
    expect(getByTestId("services-preference-screen")).toBeTruthy();
  });

  it("should hide all toasts before showing success toast", async () => {
    jest.spyOn(selectors, "profileSelector").mockReturnValue(
      pot.some({
        service_preferences_settings: {
          mode: ServicesPreferencesModeEnum.AUTO
        }
      } as any)
    );

    jest
      .spyOn(selectors, "profileServicePreferencesModeSelector")
      .mockReturnValue(ServicesPreferencesModeEnum.AUTO);

    jest
      .spyOn(usePreviousHook, "usePrevious")
      .mockImplementationOnce(() =>
        pot.toUpdating(
          pot.some({
            service_preferences_settings: {
              mode: ServicesPreferencesModeEnum.MANUAL
            }
          } as any),
          {
            service_preferences_settings: {
              mode: ServicesPreferencesModeEnum.MANUAL
            }
          } as any
        )
      ) // prevProfile
      .mockImplementationOnce(() => ServicesPreferencesModeEnum.MANUAL); // prevMode

    renderComponent();

    await waitFor(() => {
      expect(mockToast.hideAll).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith(
        I18n.t("services.optIn.preferences.quickConfig.successAlert")
      );
    });
  });

  it("should dispatch profileUpsert.request with AUTO when quick config is selected", async () => {
    const mockDispatch = jest.fn();
    jest.spyOn(hooks, "useIODispatch").mockReturnValue(mockDispatch);
    jest.spyOn(hooks, "useIOStore").mockReturnValue({
      getState: () => ({})
    } as any);

    jest.spyOn(selectors, "profileSelector").mockReturnValue(
      pot.some({
        service_preferences_settings: {
          mode: ServicesPreferencesModeEnum.MANUAL
        }
      } as any)
    );

    jest
      .spyOn(selectors, "profileServicePreferencesModeSelector")
      .mockReturnValue(ServicesPreferencesModeEnum.MANUAL);

    // simulate the previous state of the profile
    jest
      .spyOn(usePreviousHook, "usePrevious")
      .mockImplementationOnce(() =>
        pot.some({
          service_preferences_settings: {
            mode: ServicesPreferencesModeEnum.AUTO
          }
        } as any)
      ) // prevProfile
      .mockImplementationOnce(() => ServicesPreferencesModeEnum.AUTO); // prevMode

    const { getByText } = renderComponent();

    // simulate the user selecting the quick config option
    await waitFor(() => {
      fireEvent.press(
        getByText(I18n.t("services.optIn.preferences.quickConfig.title"))
      );
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      profileUpsert.request({
        service_preferences_settings: {
          mode: ServicesPreferencesModeEnum.AUTO
        }
      })
    );
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);
  return renderScreenWithNavigationStoreContext(
    ServicesPreferenceScreen,
    SETTINGS_ROUTES.PROFILE_PREFERENCES_SERVICES,
    {},
    store
  );
};
