import configureMockStore from "redux-mock-store";
import { /* fireEvent, */ render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import * as React from "react";

import FiscalCodeLandscapeOverlay, {
  Props as FiscalCodeProps
} from "../FiscalCodeLandscapeOverlay";
import { FiscalCode } from "../../../definitions/backend/FiscalCode";
import { EmailAddress } from "../../../definitions/backend/EmailAddress";
import { GlobalState } from "../../store/reducers/types";
import { applicationChangeState } from "../../store/actions/application";
import { appReducer } from "../../store/reducers";
import * as myBrightness from "../../utils/brightness";
import { PreferredLanguageEnum } from ".../../../definitions/backend/PreferredLanguage";

jest.mock("react-native-share", () => jest.fn());

describe("Test Fiscal Code Overly Lifetime methods", () => {
  afterAll(() => jest.resetAllMocks());

  const myProps: FiscalCodeProps = {
    onCancel: jest.fn(),
    profile: {
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

  it("It should render", () => {
    jest.useFakeTimers();
    const getSpy = jest.spyOn(myBrightness, "getBrightness");
    const setSpy = jest.spyOn(myBrightness, "setBrightness");

    const mockStoreFactory = configureMockStore<GlobalState>();

    const globalState: GlobalState = appReducer(
      undefined,
      applicationChangeState("active")
    );

    const myStore = mockStoreFactory({
      ...globalState,
      // While the component under test is disconnected from the store, some
      // inner components import ConnectionBar which is ocnnected
      network: { isConnected: true, actionQueue: [] }
    } as GlobalState);

    render(
      <Provider store={myStore}>
        <FiscalCodeLandscapeOverlay {...myProps} />
      </Provider>
    );

    // Device brightness is read only once when the component get rendered
    // for the first time
    expect(getSpy).toHaveBeenCalledTimes(1);
    // Device brightness is set twice: once when the brightness is raised
    // and once when the brightness is restored. Please note that the render method
    // executes also the cleanup functions of the effects
    expect(setSpy).toHaveBeenCalledTimes(2);
  });
});
