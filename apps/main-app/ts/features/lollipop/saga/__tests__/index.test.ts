import { getPublicKey, PublicKey } from "@pagopa/io-react-native-crypto";
import * as O from "fp-ts/lib/Option";
import { testSaga } from "redux-saga-test-plan";

import {
  deleteCurrentLollipopKeyAndGenerateNewKeyTag,
  generateKeyInfo,
  generateLollipopKeySaga,
  getKeyInfo,
  testable
} from "..";
import {
  lollipopKeyTagSave,
  lollipopSetPublicKey
} from "../../store/actions/lollipop";
import {
  lollipopKeyTagSelector,
  lollipopPublicKeySelector
} from "../../store/reducers/lollipop";

const { cryptoKeyGenerationSaga, deletePreviousCryptoKeyPair } = testable!;

const mockPublicKey = "mockPublicKey" as unknown as PublicKey;
const mockUUID = "mock-uuid";

jest.mock("uuid", () => ({ v4: () => mockUUID }));

jest.mock("../../utils/crypto", () => ({
  ...jest.requireActual("../../utils/crypto"),
  toBase64EncodedThumbprint: jest.fn().mockReturnValue("mockThumbprint")
}));

describe("generateKeyInfo", () => {
  it("should return a full KeyInfo when both keyTag is defined and publicKey is Some", () => {
    const result = generateKeyInfo("keyTag", O.some(mockPublicKey));
    expect(result).toEqual({
      keyTag: "keyTag",
      publicKey: mockPublicKey,
      publicKeyThumbprint: "mockThumbprint"
    });
  });

  it("should return an empty KeyInfo when keyTag is undefined", () => {
    const result = generateKeyInfo(undefined, O.some(mockPublicKey));
    expect(result).toEqual({
      keyTag: undefined,
      publicKey: undefined,
      publicKeyThumbprint: undefined
    });
  });

  it("should return an empty KeyInfo when publicKey is None", () => {
    const result = generateKeyInfo("keyTag", O.none);
    expect(result).toEqual({
      keyTag: undefined,
      publicKey: undefined,
      publicKeyThumbprint: undefined
    });
  });
});

describe("getKeyInfo", () => {
  it("should select keyTag and publicKey and generate the KeyInfo", () => {
    const keyInfo = {
      keyTag: "keyTag",
      publicKey: mockPublicKey,
      publicKeyThumbprint: "mockThumbprint"
    };

    testSaga(getKeyInfo)
      .next()
      .select(lollipopKeyTagSelector)
      .next("keyTag")
      .select(lollipopPublicKeySelector)
      .next(O.some(mockPublicKey))
      .call(generateKeyInfo, "keyTag", O.some(mockPublicKey))
      .next(keyInfo)
      .returns(keyInfo);
  });
});

describe("generateLollipopKeySaga", () => {
  it("should generate a new keyTag and crypto key pair when no keyTag is present", () => {
    testSaga(generateLollipopKeySaga)
      .next()
      .select(lollipopKeyTagSelector)
      .next(undefined)
      .put(lollipopKeyTagSave({ keyTag: mockUUID }))
      .next()
      .call(cryptoKeyGenerationSaga, mockUUID, undefined)
      .next()
      .isDone();
  });

  it("should reuse the existing keyTag and set the public key when it already exists on keystore", () => {
    testSaga(generateLollipopKeySaga)
      .next()
      .select(lollipopKeyTagSelector)
      .next("existingKeyTag")
      .call(getPublicKey, "existingKeyTag")
      .next(mockPublicKey)
      .put(lollipopSetPublicKey({ publicKey: mockPublicKey }))
      .next()
      .isDone();
  });

  it("should regenerate the crypto key pair when getPublicKey fails for the existing keyTag", () => {
    testSaga(generateLollipopKeySaga)
      .next()
      .select(lollipopKeyTagSelector)
      .next("existingKeyTag")
      .call(getPublicKey, "existingKeyTag")
      .throw(new Error("not found"))
      .call(cryptoKeyGenerationSaga, "existingKeyTag", undefined)
      .next()
      .isDone();
  });
});

describe("deleteCurrentLollipopKeyAndGenerateNewKeyTag", () => {
  it("should delete the current key pair (if any) and generate a new keyTag", () => {
    testSaga(deleteCurrentLollipopKeyAndGenerateNewKeyTag)
      .next()
      .select(lollipopKeyTagSelector)
      .next("oldKeyTag")
      .call(deletePreviousCryptoKeyPair, "oldKeyTag")
      .next()
      .put(lollipopKeyTagSave({ keyTag: mockUUID }))
      .next()
      .isDone();
  });

  it("should call deletePreviousCryptoKeyPair with undefined when there is no current keyTag", () => {
    testSaga(deleteCurrentLollipopKeyAndGenerateNewKeyTag)
      .next()
      .select(lollipopKeyTagSelector)
      .next(undefined)
      .call(deletePreviousCryptoKeyPair, undefined)
      .next()
      .put(lollipopKeyTagSave({ keyTag: mockUUID }))
      .next()
      .isDone();
  });
});
