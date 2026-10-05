import { PublicKey } from "@pagopa/io-react-native-crypto";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import { handleRegenerateEphemeralKey } from "../..";
import { useIODispatch } from "../../../../store/hooks";
import { hashedProfileFiscalCodeSelector } from "../../../../store/reducers/crossSessions";
import { isMixpanelEnabled } from "../../../../store/reducers/persistedPreferences";
import {
  isActiveSessionFastLoginEnabledSelector,
  isActiveSessionLoginSelector
} from "../../../authentication/activeSessionLogin/store/selectors";
import { selectedIdentityProviderSelector } from "../../../authentication/common/store/selectors";
import { getLoginHeaders } from "../../../authentication/common/utils";
import { isFastLoginEnabledSelector } from "../../../authentication/fastLogin/store/selectors";
import {
  ephemeralKeyTagSelector,
  ephemeralPublicKeySelector
} from "../../store/reducers/lollipop";
import { useLollipopLoginSource } from "../useLollipopLoginSource";

// This test suite only covers `regenerateLoginSource`/`retryLollipopLogin`,
// the code path rewritten from fp-ts (pipe/Task/Option) to async/await.

jest.mock("../..", () => ({
  handleRegenerateEphemeralKey: jest.fn()
}));

jest.mock("../../../../store/hooks", () => ({
  useIODispatch: jest.fn(),
  useIOSelector: (selector: () => any) => selector()
}));

jest.mock("../../../../store/reducers/crossSessions");
jest.mock("../../../../store/reducers/persistedPreferences");
jest.mock("../../../../utils/analytics");
jest.mock("../../../authentication/activeSessionLogin/store/selectors");
jest.mock("../../../authentication/common/store/selectors");
jest.mock("../../../authentication/common/utils");
jest.mock("../../../authentication/fastLogin/store/selectors");
jest.mock("../../../authentication/login/cie/utils", () => ({
  cieFlowForDevServerEnabled: false
}));
jest.mock("../../store/reducers/lollipop");

jest.mock("../../utils/login", () => ({
  DEFAULT_LOLLIPOP_HASH_ALGORITHM_SERVER: "sha256",
  lollipopSamlVerify: jest.fn()
}));

const mockDispatch = jest.fn();
const mockUseIODispatch = jest.mocked(useIODispatch);
const mockHandleRegenerateEphemeralKey = jest.mocked(
  handleRegenerateEphemeralKey
);
const mockEphemeralKeyTagSelector = jest.mocked(ephemeralKeyTagSelector);
const mockEphemeralPublicKeySelector = jest.mocked(ephemeralPublicKeySelector);
const mockIsMixpanelEnabled = jest.mocked(isMixpanelEnabled);
const mockIsFastLoginEnabledSelector = jest.mocked(isFastLoginEnabledSelector);
const mockSelectedIdentityProviderSelector = jest.mocked(
  selectedIdentityProviderSelector
);
const mockIsActiveSessionLoginSelector = jest.mocked(
  isActiveSessionLoginSelector
);
const mockHashedProfileFiscalCodeSelector = jest.mocked(
  hashedProfileFiscalCodeSelector
);
const mockIsActiveSessionFastLoginEnabledSelector = jest.mocked(
  isActiveSessionFastLoginEnabledSelector
);
const mockGetLoginHeaders = jest.mocked(getLoginHeaders);

const loginUri = "https://idp.example.com/login";
const onLollipopCheckFailure = jest.fn();

const publicKey = { kty: "EC" } as unknown as PublicKey;

describe("useLollipopLoginSource - regenerateLoginSource", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIODispatch.mockReturnValue(mockDispatch);
    mockEphemeralKeyTagSelector.mockReturnValue("key-tag");
    mockEphemeralPublicKeySelector.mockReturnValue(publicKey);
    mockIsMixpanelEnabled.mockReturnValue(false);
    mockIsFastLoginEnabledSelector.mockReturnValue(false);
    mockSelectedIdentityProviderSelector.mockReturnValue(undefined);
    mockIsActiveSessionLoginSelector.mockReturnValue(false);
    mockHashedProfileFiscalCodeSelector.mockReturnValue(undefined);
    mockIsActiveSessionFastLoginEnabledSelector.mockReturnValue(false);
    mockGetLoginHeaders.mockReturnValue({
      "x-pagopa-idp-id": undefined,
      "x-pagopa-lollipop-pub-key": "k",
      "x-pagopa-lollipop-pub-key-hash-algo": "sha256"
    });
  });

  const renderUseLollipopLoginSource = (uri?: string) =>
    renderHook(() =>
      useLollipopLoginSource(onLollipopCheckFailure, uri ?? loginUri)
    );

  it("should not set webviewSource when loginUri is undefined", async () => {
    const { result } = renderHook(() =>
      useLollipopLoginSource(onLollipopCheckFailure, undefined)
    );

    await waitFor(() => {
      expect(mockHandleRegenerateEphemeralKey).not.toHaveBeenCalled();
    });
    expect(result.current.webviewSource).toBeUndefined();
  });

  it("should set webviewSource with uri and headers when a key is regenerated", async () => {
    mockHandleRegenerateEphemeralKey.mockResolvedValue(publicKey);

    const { result } = renderUseLollipopLoginSource();

    await waitFor(() => {
      expect(result.current.webviewSource).toEqual({
        uri: loginUri,
        headers: {
          "x-pagopa-idp-id": undefined,
          "x-pagopa-lollipop-pub-key": "k",
          "x-pagopa-lollipop-pub-key-hash-algo": "sha256"
        }
      });
    });
    expect(mockGetLoginHeaders).toHaveBeenCalledWith(
      publicKey,
      "sha256",
      false,
      undefined,
      undefined
    );
  });

  it("should set webviewSource with only uri when no key is regenerated", async () => {
    mockHandleRegenerateEphemeralKey.mockResolvedValue(undefined);

    const { result } = renderUseLollipopLoginSource();

    await waitFor(() => {
      expect(result.current.webviewSource).toEqual({ uri: loginUri });
    });
    expect(mockGetLoginHeaders).not.toHaveBeenCalled();
  });

  it("should reset status and webviewSource, then regenerate it on retryLollipopLogin", async () => {
    mockHandleRegenerateEphemeralKey.mockResolvedValue(publicKey);
    const { result } = renderUseLollipopLoginSource();

    await waitFor(() => {
      expect(result.current.webviewSource).toBeDefined();
    });

    mockHandleRegenerateEphemeralKey.mockClear();
    mockHandleRegenerateEphemeralKey.mockResolvedValue(undefined);

    act(() => {
      result.current.retryLollipopLogin();
    });

    expect(result.current.lollipopCheckStatus).toEqual({ status: "none" });

    await waitFor(() => {
      expect(result.current.webviewSource).toEqual({ uri: loginUri });
    });
    expect(mockHandleRegenerateEphemeralKey).toHaveBeenCalledTimes(1);
  });
});
