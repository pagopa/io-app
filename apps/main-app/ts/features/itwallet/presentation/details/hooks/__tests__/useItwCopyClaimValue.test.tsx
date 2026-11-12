import { renderHook } from "@testing-library/react-native";
import { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { clipboardSetStringWithFeedback } from "../../../../../../utils/clipboard";
import { trackCopyListItem } from "../../../../analytics";
import { getMixPanelCredential } from "../../../../analytics/utils";
import { CredentialType } from "../../../../common/utils/itwMocksUtils";
import * as lifecycleSelectors from "../../../../lifecycle/store/selectors";
import { useItwCopyClaimValue } from "../useItwCopyClaimValue";

jest.mock("../../../../../../utils/clipboard", () => ({
  clipboardSetStringWithFeedback: jest.fn()
}));

jest.mock("../../../../analytics", () => ({
  ...jest.requireActual("../../../../analytics"),
  trackCopyListItem: jest.fn()
}));

describe("useItwCopyClaimValue", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test.each([
    { name: "IT-Wallet", isItwL3: true },
    { name: "Documenti su IO", isItwL3: false }
  ])("copies the value and tracks the copy for $name users", ({ isItwL3 }) => {
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(isItwL3);

    const copyClaimValue = renderCopyClaimValueHook(
      CredentialType.DRIVING_LICENSE
    );
    copyClaimValue("Claim label", "Mario");

    expect(clipboardSetStringWithFeedback).toHaveBeenCalledWith("Mario");
    expect(trackCopyListItem).toHaveBeenCalledWith({
      credential: getMixPanelCredential(
        CredentialType.DRIVING_LICENSE,
        isItwL3
      ),
      item_copied: "Claim label"
    });
  });
});

const renderCopyClaimValueHook = (credentialType: string) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = configureMockStore<GlobalState>()(initialState);
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );
  const { result } = renderHook(() => useItwCopyClaimValue(credentialType), {
    wrapper
  });

  return result.current;
};
