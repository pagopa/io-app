import { renderHook } from "@testing-library/react-native";
import React from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import * as supportAssistance from "../../../../../utils/supportAssistance";
import {
  ZendeskSubcategoryValue,
  useItwZendeskSupport
} from "../useItwZendeskSupport";

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useRoute: () => ({ name: "MOCK_SCREEN" })
}));

jest.mock("../../../../../utils/supportAssistance", () => ({
  ...jest.requireActual("../../../../../utils/supportAssistance"),
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

const baseParams = {
  subcategory: ZendeskSubcategoryValue.IT_WALLET_AGGIUNTA_DOCUMENTI
};

const renderAndCall = (
  params: Parameters<
    ReturnType<typeof useItwZendeskSupport>["startItwZendeskSupport"]
  >[0]
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store = mockStore(initialState);

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  const { result } = renderHook(() => useItwZendeskSupport(), { wrapper });
  result.current.startItwZendeskSupport(params);

  return store.getActions();
};

describe("useItwZendeskSupport", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAssistanceToolRemoteConfig.mockReturnValue("zendesk");
  });

  it("dispatches zendeskSupportStart with itWallet: true", () => {
    const actions = renderAndCall(baseParams);

    const action = actions.find(a => a.type === "ZENDESK_SUPPORT_START");
    expect(action).toBeDefined();
    expect(action?.payload?.assistanceType?.itWallet).toBe(true);
  });

  it("uses the current route name as startingRoute", () => {
    const actions = renderAndCall(baseParams);

    const action = actions.find(a => a.type === "ZENDESK_SUPPORT_START");
    expect(action?.payload?.startingRoute).toBe("MOCK_SCREEN");
  });

  it("dispatches zendeskSelectedCategory with it_wallet category", () => {
    const actions = renderAndCall(baseParams);

    const action = actions.find(a => a.type === "ZENDESK_SELECTED_CATEGORY");
    expect(action).toBeDefined();
    expect(action?.payload?.value).toBe("it_wallet");
  });

  it("sets the it_wallet category custom field", () => {
    renderAndCall(baseParams);

    expect(mockedAddTicketCustomField).toHaveBeenCalledWith(
      supportAssistance.zendeskCategoryId,
      supportAssistance.zendeskItWalletCategory.value
    );
  });

  it("sets the subcategory custom field", () => {
    renderAndCall({
      ...baseParams,
      subcategory: ZendeskSubcategoryValue.IT_WALLET_PRESENTAZIONE_REMOTA
    });

    expect(mockedAddTicketCustomField).toHaveBeenCalledWith(
      supportAssistance.zendeskItWalletSubcategoryId,
      ZendeskSubcategoryValue.IT_WALLET_PRESENTAZIONE_REMOTA
    );
  });

  it("sets the failure code field when errorCode is provided", () => {
    renderAndCall({ ...baseParams, errorCode: "some_error_code" });

    expect(mockedAddTicketCustomField).toHaveBeenCalledWith(
      supportAssistance.zendeskItWalletFailureCode,
      "some_error_code"
    );
  });

  it("does NOT set the failure code field when errorCode is absent", () => {
    renderAndCall(baseParams);

    expect(mockedAddTicketCustomField).not.toHaveBeenCalledWith(
      supportAssistance.zendeskItWalletFailureCode,
      expect.anything()
    );
  });

  it("appends log when logData is provided", () => {
    renderAndCall({ ...baseParams, logData: '{"type":"SOME_FAILURE"}' });

    expect(mockedAppendLog).toHaveBeenCalledWith('{"type":"SOME_FAILURE"}');
  });

  it("does NOT append log when logData is absent", () => {
    renderAndCall(baseParams);

    expect(mockedAppendLog).not.toHaveBeenCalled();
  });

  it("resets custom fields and log before setting new ones", () => {
    renderAndCall(baseParams);

    expect(mockedResetCustomFields).toHaveBeenCalledTimes(1);
    expect(mockedResetLog).toHaveBeenCalledTimes(1);
  });

  it("does nothing when the selected tool is not Zendesk", () => {
    mockedAssistanceToolRemoteConfig.mockReturnValue("none");

    const actions = renderAndCall(baseParams);

    expect(actions).toHaveLength(0);
    expect(mockedResetCustomFields).not.toHaveBeenCalled();
    expect(mockedAddTicketCustomField).not.toHaveBeenCalled();
  });
});
