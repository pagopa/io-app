import { renderHook } from "@testing-library/react-native";
import React from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import * as supportAssistance from "../../../../../utils/supportAssistance";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";
import {
  useItwZendeskSupport,
  ZendeskSubcategoryValue
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
    jest.restoreAllMocks();
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

  test.each([
    {
      name: "IT-Wallet user",
      isItwValid: true,
      expectedCategory: "it_wallet2"
    },
    {
      name: "Documenti su IO user",
      isItwValid: false,
      expectedCategory: "it_wallet"
    }
  ])(
    "uses the $expectedCategory category for $name",
    ({ isItwValid, expectedCategory }) => {
      jest
        .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
        .mockReturnValue(isItwValid);

      const actions = renderAndCall(baseParams);

      const action = actions.find(a => a.type === "ZENDESK_SELECTED_CATEGORY");
      expect(action?.payload?.value).toBe(expectedCategory);
      expect(mockedAddTicketCustomField).toHaveBeenCalledWith(
        supportAssistance.zendeskCategoryId,
        expectedCategory
      );
    }
  );

  it("uses the provided category instead of the wallet status one", () => {
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(false);

    const actions = renderAndCall({
      ...baseParams,
      category: supportAssistance.zendeskItWalletCategory
    });

    const action = actions.find(a => a.type === "ZENDESK_SELECTED_CATEGORY");
    expect(action?.payload?.value).toBe("it_wallet2");
    expect(mockedAddTicketCustomField).toHaveBeenCalledWith(
      supportAssistance.zendeskCategoryId,
      "it_wallet2"
    );
  });

  test.each([
    {
      name: "IT-Wallet document issuance",
      category: supportAssistance.zendeskItWalletCategory,
      subcategory: ZendeskSubcategoryValue.IT_WALLET_AGGIUNTA_DOCUMENTI,
      expectedSubcategory: "it_wallet2_aggiunta_documenti"
    },
    {
      name: "IT-Wallet remote presentation",
      category: supportAssistance.zendeskItWalletCategory,
      subcategory: ZendeskSubcategoryValue.IT_WALLET_PRESENTAZIONE_REMOTA,
      expectedSubcategory: "it_wallet2_presentazione_remota"
    },
    {
      name: "Documenti su IO document issuance",
      category: supportAssistance.zendeskDocumentiSuIoCategory,
      subcategory: ZendeskSubcategoryValue.IT_WALLET_AGGIUNTA_DOCUMENTI,
      expectedSubcategory: "it_wallet_aggiunta_documenti"
    },
    {
      name: "Documenti su IO remote presentation",
      category: supportAssistance.zendeskDocumentiSuIoCategory,
      subcategory: ZendeskSubcategoryValue.IT_WALLET_PRESENTAZIONE_REMOTA,
      expectedSubcategory: "it_wallet_presentazione_remota"
    }
  ])(
    "sets the $expectedSubcategory subcategory for $name",
    ({ category, subcategory, expectedSubcategory }) => {
      renderAndCall({ category, subcategory });

      expect(mockedAddTicketCustomField).toHaveBeenCalledWith(
        supportAssistance.zendeskItWalletSubcategoryId,
        expectedSubcategory
      );
    }
  );

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
