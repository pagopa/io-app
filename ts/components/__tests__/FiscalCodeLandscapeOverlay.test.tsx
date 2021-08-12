import configureMockStore from "redux-mock-store";
import { render, waitFor } from "@testing-library/react-native";
import { Provider } from "react-redux";
import * as React from "react";
import { tryCatch } from "fp-ts/lib/TaskEither";

import FiscalCodeLandscapeOverlay, {
  Props as FiscalCodeProps
} from "../FiscalCodeLandscapeOverlay";
import { FiscalCode } from "../../../definitions/backend/FiscalCode";
import { EmailAddress } from "../../../definitions/backend/EmailAddress";
import { GlobalState } from "../../store/reducers/types";
import { applicationChangeState } from "../../store/actions/application";
import { appReducer } from "../../store/reducers";
import * as myBrightness from "../../utils/brightness";
import { ServicesPreferencesModeEnum } from "../../../definitions/backend/ServicesPreferencesMode";
import { PreferredLanguageEnum } from ".../../../definitions/backend/PreferredLanguage";

jest.mock("react-native-share", () => jest.fn());

describe("Test How Fiscal Code Overlay gets rendered on lifetime methods", () => {
  afterAll(() => jest.resetAllMocks());

  const myProps: FiscalCodeProps = {
    onCancel: jest.fn(),
    profile: {
      service_preferences_settings: {
        mode: ServicesPreferencesModeEnum.AUTO
      },
      accepted_tos_version: 3,
      blocked_inbox_or_channels: {},
      email: "pippo@fake-email.it" as EmailAddress,
      family_name: "Rossi",
      fiscal_code: "ZXCVBN66Z66K666Q" as FiscalCode,
      has_profile: true,
      is_email_enabled: false,
      is_email_validated: true,
      is_inbox_enabled: true,
      is_webhook_enabled: true,
      name: "Mario",
      preferred_languages: ["it_IT"] as Array<PreferredLanguageEnum>,
      version: 7
    },
    municipality: {
      error: {
        name: "myError",
        message: "myMessage"
      },
      kind: "PotNoneError"
    },
    showBackSide: false
  };

  it("Should call getBrightness and setBrightness", async () => {
    const getSpy = jest.spyOn(myBrightness, "getBrightness").mockReturnValue(
      tryCatch(
        () => new Promise(() => 0),
        reason => new Error(String(reason))
      )
    );

    const mockStoreFactory = configureMockStore<GlobalState>();

    const globalState: GlobalState = appReducer(
      undefined,
      applicationChangeState("active")
    );

    const myStore = mockStoreFactory({
      ...globalState,
      // While the component under test is disconnected from the store, some
      // inner components import ConnectionBar which is connected
      network: { isConnected: true, actionQueue: [] }
    } as GlobalState);

    const component = render(
      <Provider store={myStore}>
        <FiscalCodeLandscapeOverlay {...myProps} />
      </Provider>
    );

    const myButton = component.queryByA11yLabel("Chiudi");

    component.unmount();
    await waitFor(() => expect(myButton).toBeNull(), {
      timeout: 10000
    });

    // Read the brightness
    expect(getSpy).toHaveBeenCalled();
  });
});
