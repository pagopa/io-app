import { PreloadedState, createStore } from "redux";
import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import FiscalCodeScreen from "../FiscalCodeScreen";
import { profileLoadSuccess } from "../../../common/store/actions";
import { EmailAddress } from "../../../../../../definitions/auth/EmailAddress";
import { ServicesPreferencesModeEnum } from "../../../../../../definitions/auth/ServicesPreferencesMode";
import { SETTINGS_ROUTES } from "../../../common/navigation/routes";

jest.mock("../../../../../utils/brightness", () => ({
  useMaxBrightness: jest.fn()
}));

const FISCAL_CODE_TEST = "AAAAAA00A00A000A" as FiscalCode;

describe(FiscalCodeScreen, () => {
  it("Should be defined", () => {
    const { component } = renderComponent();

    expect(component).not.toBeNull();
  });
  it("Should display the barcode with the correct tax code", () => {
    const { component } = renderComponent();

    const barcode = component.getByTestId(/barcode-box/);
    const taxCode = component.getByTestId(/fiscal-code/);

    expect(barcode).toBeDefined();
    expect(taxCode).toHaveTextContent(FISCAL_CODE_TEST);
  });
});

const renderComponent = () => {
  const globalState = appReducer(
    undefined,
    applicationChangeState("active")
  ) as PreloadedState<GlobalState>;
  const store = createStore(appReducer, globalState);

  store.dispatch(
    profileLoadSuccess({
      is_inbox_enabled: true,
      is_email_enabled: true,
      is_webhook_enabled: true,
      is_email_already_taken: false,
      family_name: "Red",
      fiscal_code: FISCAL_CODE_TEST,
      has_profile: true,
      name: "Tom",
      service_preferences_settings: { mode: ServicesPreferencesModeEnum.AUTO },
      version: 1,
      email: "this@email.it" as EmailAddress
    })
  );

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      FiscalCodeScreen,
      SETTINGS_ROUTES.PROFILE_FISCAL_CODE,
      {},
      store
    ),
    store
  };
};
