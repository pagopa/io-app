import { PublicKey } from "@pagopa/io-react-native-crypto";
import {
  lollipopKeyTagSave,
  lollipopRemoveEphemeralPublicKey,
  lollipopRemovePublicKey,
  lollipopSetEphemeralPublicKey,
  lollipopSetPublicKey,
  lollipopSetSupportedDevice
} from "../lollipop";

describe("Lollipop Actions", () => {
  it("should create an action to save a key tag", () => {
    const payload = { keyTag: "test-key-tag" };
    const action = lollipopKeyTagSave(payload);
    expect(action.type).toBe("LOLLIPOP_KEY_TAG_SAVE");
    expect(action.payload).toEqual(payload);
  });

  it("should create an action to set a public key", () => {
    const payload: { publicKey: PublicKey } = {
      publicKey: "test-public-key" as unknown as PublicKey
    };
    const action = lollipopSetPublicKey(payload);
    expect(action.type).toBe("LOLLIPOP_SET_PUBLIC_KEY");
    expect(action.payload).toEqual(payload);
  });

  it("should create an action to remove a public key", () => {
    const action = lollipopRemovePublicKey();
    expect(action.type).toBe("LOLLIPOP_REMOVE_PUBLIC_KEY");
  });

  it("should create an action to set an ephemeral public key", () => {
    const payload: { publicKey: PublicKey } = {
      publicKey: "test-ephemeral-key" as unknown as PublicKey
    };
    const action = lollipopSetEphemeralPublicKey(payload);
    expect(action.type).toBe("LOLLIPOP_SET_EPHEMERAL_PUBLIC_KEY");
    expect(action.payload).toEqual(payload);
  });

  it("should create an action to remove an ephemeral public key", () => {
    const action = lollipopRemoveEphemeralPublicKey();
    expect(action.type).toBe("LOLLIPOP_REMOVE_EPHEMERAL_PUBLIC_KEY");
  });

  it("should create an action to set supported device", () => {
    const payload = true;
    const action = lollipopSetSupportedDevice(payload);
    expect(action.type).toBe("LOLLIPOP_SET_SUPPORTED_DEVICE");
    expect(action.payload).toBe(payload);
  });
});
