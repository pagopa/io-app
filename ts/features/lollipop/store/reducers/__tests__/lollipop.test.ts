import * as O from "fp-ts/lib/Option";
import { PublicKey } from "@pagopa/io-react-native-crypto";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import {
  lollipopKeyTagSave,
  lollipopRemoveEphemeralPublicKey,
  lollipopRemovePublicKey,
  lollipopSetEphemeralPublicKey,
  lollipopSetPublicKey,
  lollipopSetSupportedDevice
} from "../../actions/lollipop";
import lollipopReducer, { testable } from "./../lollipop";

jest.mock("react-native-device-info", () => ({
  getReadableVersion: jest.fn().mockReturnValue("1.2.3.4"),
  getVersion: jest.fn().mockReturnValue("1.2.3.4")
}));

const globalState = appReducer(undefined, applicationChangeState("active"));

describe("Lollipop state", () => {
  it("Test selectors and reducers", () => {
    const lollipopState = testable?.lollipopSelector(globalState);
    expect(lollipopState?.keyTag).toBe(O.none);
    const newLollipopState = lollipopReducer(
      lollipopState,
      lollipopKeyTagSave({ keyTag: "newKeyTag" })
    );
    expect(newLollipopState.keyTag).toStrictEqual(O.some("newKeyTag"));
  });

  it("should handle lollipopSetPublicKey action", () => {
    const lollipopState = testable?.lollipopSelector(globalState);
    const publicKey = {
      publicKey: "publicKey" as unknown as PublicKey
    };
    const newLollipopState = lollipopReducer(
      lollipopState,
      lollipopSetPublicKey({ publicKey: publicKey.publicKey })
    );
    expect(newLollipopState.publicKey).toStrictEqual(
      O.some(publicKey.publicKey)
    );
  });

  it("should handle lollipopRemovePublicKey action", () => {
    const lollipopState = testable?.lollipopSelector(globalState);
    const stateWithPublicKey = lollipopReducer(
      lollipopState,
      lollipopSetPublicKey({ publicKey: "publicKey" as unknown as PublicKey })
    );
    const newLollipopState = lollipopReducer(
      stateWithPublicKey,
      lollipopRemovePublicKey()
    );
    expect(newLollipopState.publicKey).toBe(O.none);
  });

  it("should handle lollipopSetEphemeralPublicKey action", () => {
    const lollipopState = testable?.lollipopSelector(globalState);
    const ephemeralPublicKey = "ephemeralPublicKey" as unknown as PublicKey;
    const newLollipopState = lollipopReducer(
      lollipopState,
      lollipopSetEphemeralPublicKey({
        publicKey: ephemeralPublicKey
      })
    );
    expect(newLollipopState.ephemeralKey.ephemeralPublicKey).toStrictEqual(
      ephemeralPublicKey
    );
  });

  it("should handle lollipopRemoveEphemeralPublicKey action", () => {
    const lollipopState = testable?.lollipopSelector(globalState);
    const stateWithEphemeralPublicKey = lollipopReducer(
      lollipopState,
      lollipopSetEphemeralPublicKey({
        publicKey: "ephemeralPublicKey" as unknown as PublicKey
      })
    );
    const newLollipopState = lollipopReducer(
      stateWithEphemeralPublicKey,
      lollipopRemoveEphemeralPublicKey()
    );
    expect(newLollipopState.ephemeralKey.ephemeralPublicKey).toBe(undefined);
  });

  it("should handle lollipopSetSupportedDevice action", () => {
    const lollipopState = testable?.lollipopSelector(globalState);
    const newLollipopState = lollipopReducer(
      lollipopState,
      lollipopSetSupportedDevice(true)
    );
    expect(newLollipopState.supportedDevice).toBe(true);
  });
});
