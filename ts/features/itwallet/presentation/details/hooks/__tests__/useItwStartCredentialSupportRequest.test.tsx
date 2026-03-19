import { renderHook } from "@testing-library/react-native";
import React from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { GlobalState } from "../../../../../../store/reducers/types";
import * as supportAssistance from "../../../../../../utils/supportAssistance";
import { StoredCredential } from "../../../../common/utils/itwTypesUtils";
import { ZendeskSubcategoryValue } from "../../../../common/hooks/useItwZendeskSupport";
import { useItwStartCredentialSupportRequest } from "../useItwStartCredentialSupportRequest";

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useRoute: () => ({ name: "MOCK_SCREEN" })
}));

jest.mock("../../../../../../utils/supportAssistance", () => ({
  ...jest.requireActual("../../../../../../utils/supportAssistance"),
  assistanceToolRemoteConfig: jest.fn(),
  resetCustomFields: jest.fn(),
  resetLog: jest.fn(),
  addTicketCustomField: jest.fn(),
  appendLog: jest.fn()
}));

const mockedAssistanceToolRemoteConfig =
  supportAssistance.assistanceToolRemoteConfig as jest.Mock;
const mockedResetCustomFields =
  supportAssistance.resetCustomFields as jest.Mock;
const mockedResetLog = supportAssistance.resetLog as jest.Mock;
const mockedAddTicketCustomField =
  supportAssistance.addTicketCustomField as jest.Mock;
const mockedAppendLog = supportAssistance.appendLog as jest.Mock;

const baseMockedCredential: StoredCredential = {
  credential: "",
  credentialType: "mDL",
  credentialId: "dc_sd_jwt_mDL",
  parsedCredential: {},
  format: "dc+sd-jwt",
  keyTag: "1",
  issuerConf: {} as StoredCredential["issuerConf"],
  jwt: {
    issuedAt: "2024-09-30T07:32:49.000Z",
    expiration: "2100-09-04T00:00:00.000Z"
  },
  spec_version: "1.0.0"
};

const renderAndAct = (credential: StoredCredential) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store = mockStore(initialState);

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  const { result } = renderHook(
    () => useItwStartCredentialSupportRequest(credential),
    { wrapper }
  );

  result.current();

  return store.getActions();
};

describe("useItwStartCredentialSupportRequest", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAssistanceToolRemoteConfig.mockReturnValue("zendesk");
  });

  it("dispatches zendeskSupportStart with itWallet: true", () => {
    const actions = renderAndAct(baseMockedCredential);

    const supportStartAction = actions.find(
      a => a.type === "ZENDESK_SUPPORT_START"
    );
    expect(supportStartAction).toBeDefined();
    expect(supportStartAction?.payload?.assistanceType?.itWallet).toBe(true);
  });

  it("dispatches zendeskSelectedCategory with it_wallet category", () => {
    const actions = renderAndAct(baseMockedCredential);

    const selectedCategoryAction = actions.find(
      a => a.type === "ZENDESK_SELECTED_CATEGORY"
    );
    expect(selectedCategoryAction).toBeDefined();
    expect(selectedCategoryAction?.payload?.value).toBe("it_wallet");
  });

  it("sets the IT Wallet category custom field", () => {
    renderAndAct(baseMockedCredential);

    expect(mockedAddTicketCustomField).toHaveBeenCalledWith(
      supportAssistance.zendeskCategoryId,
      supportAssistance.zendeskItWalletCategory.value
    );
  });

  it("sets the IT Wallet subcategory custom field to IT_WALLET_AGGIUNTA_DOCUMENTI", () => {
    renderAndAct(baseMockedCredential);

    expect(mockedAddTicketCustomField).toHaveBeenCalledWith(
      supportAssistance.zendeskItWalletSubcategoryId,
      ZendeskSubcategoryValue.IT_WALLET_AGGIUNTA_DOCUMENTI
    );
  });

  it("does NOT set the failure code field when storedStatusAssertion is absent", () => {
    renderAndAct(baseMockedCredential);

    expect(mockedAddTicketCustomField).not.toHaveBeenCalledWith(
      supportAssistance.zendeskItWalletFailureCode,
      expect.anything()
    );
    expect(mockedAppendLog).not.toHaveBeenCalled();
  });

  it("sets the failure code field and appends log when storedStatusAssertion errorCode is present", () => {
    const credentialWithError: StoredCredential = {
      ...baseMockedCredential,
      storedStatusAssertion: {
        credentialStatus: "invalid",
        errorCode: "driving_license_suspended"
      }
    };

    renderAndAct(credentialWithError);

    expect(mockedAddTicketCustomField).toHaveBeenCalledWith(
      supportAssistance.zendeskItWalletFailureCode,
      "driving_license_suspended"
    );
    expect(mockedAppendLog).toHaveBeenCalledWith("driving_license_suspended");
  });

  it("does NOT dispatch Zendesk actions when the selected tool is not Zendesk", () => {
    mockedAssistanceToolRemoteConfig.mockReturnValue("none");

    const actions = renderAndAct(baseMockedCredential);

    expect(actions).toHaveLength(0);
    expect(mockedResetCustomFields).not.toHaveBeenCalled();
    expect(mockedResetLog).not.toHaveBeenCalled();
  });

  it("resets custom fields and log before setting new ones", () => {
    renderAndAct(baseMockedCredential);

    expect(mockedResetCustomFields).toHaveBeenCalledTimes(1);
    expect(mockedResetLog).toHaveBeenCalledTimes(1);
  });
});
