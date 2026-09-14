import { PublicKey } from "@pagopa/io-react-native-crypto";
import { render, waitFor } from "@testing-library/react-native";
import * as E from "fp-ts/lib/Either";

import { identityClientManager } from "../../../../api/IdentityClientManager";
import { useIOSelector } from "../../../../store/hooks";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import {
  lollipopKeyTagSelector,
  lollipopPublicKeySelector
} from "../../store/reducers/lollipop";
import LollipopPlayground from "../LollipopPlayground";

jest.mock("../../../../hooks/useHeaderSecondLevel", () => ({
  useHeaderSecondLevel: jest.fn()
}));
jest.mock("../../../../store/hooks", () => ({
  ...jest.requireActual("../../../../store/hooks"),
  useIOSelector: jest.fn()
}));

// eslint-disable-next-line functional/no-let
let capturedOnSignButtonPress: ((body: string) => void) | undefined;
jest.mock("../LollipopPlaygroundContent", () => ({
  __esModule: true,
  default: (props: { onSignButtonPress: (body: string) => void }) => {
    capturedOnSignButtonPress = props.onSignButtonPress;
    return null;
  }
}));

const mockSignMessage = jest.fn();

jest.spyOn(identityClientManager, "getClient").mockReturnValue({
  signMessage: mockSignMessage
} as any);

const selectorValues = (overrides: {
  keyTag?: string;
  publicKey?: PublicKey;
  sessionToken?: string;
}) => {
  const keyTag = "keyTag" in overrides ? overrides.keyTag : "mock-key-tag";
  const sessionToken =
    "sessionToken" in overrides ? overrides.sessionToken : "mock-session-token";
  const publicKey =
    "publicKey" in overrides ? overrides.publicKey : "mock-public-yey";
  (useIOSelector as jest.Mock).mockImplementation(selector => {
    if (selector === sessionTokenSelector) {
      return sessionToken;
    }
    if (selector === lollipopPublicKeySelector) {
      return publicKey;
    }
    if (selector === lollipopKeyTagSelector) {
      return keyTag;
    }
    return undefined;
  });
};

describe("LollipopPlayground", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignMessage.mockResolvedValue(E.right({ status: 200, value: {} }));
  });

  it("should call signMessage when sessionToken, publicKey and keyTag are all Some/defined", async () => {
    selectorValues({});
    render(<LollipopPlayground />);

    capturedOnSignButtonPress?.("body");

    await waitFor(() => {
      expect(mockSignMessage).toHaveBeenCalled();
    });
    expect(identityClientManager.getClient).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        token: "mock-session-token",
        keyInfo: expect.objectContaining({ keyTag: "mock-key-tag" })
      })
    );
  });

  it("should not call signMessage when keyTag is None", () => {
    selectorValues({ keyTag: undefined });
    render(<LollipopPlayground />);

    capturedOnSignButtonPress?.("body");

    expect(identityClientManager.getClient).not.toHaveBeenCalled();
    expect(mockSignMessage).not.toHaveBeenCalled();
  });

  it("should not call signMessage when publicKey is undefined", () => {
    selectorValues({ publicKey: undefined });
    render(<LollipopPlayground />);

    capturedOnSignButtonPress?.("body");

    expect(identityClientManager.getClient).not.toHaveBeenCalled();
    expect(mockSignMessage).not.toHaveBeenCalled();
  });

  it("should not call signMessage when sessionToken is undefined", () => {
    selectorValues({ sessionToken: undefined });
    render(<LollipopPlayground />);

    capturedOnSignButtonPress?.("body");

    expect(identityClientManager.getClient).not.toHaveBeenCalled();
    expect(mockSignMessage).not.toHaveBeenCalled();
  });
});
