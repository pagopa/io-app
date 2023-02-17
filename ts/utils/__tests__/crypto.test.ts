import {
  getKeyGenerationInfo,
  KeyGenerationInfo,
  setKeyGenerationInfo
} from "./../crypto";

const KEY_NAME = "test-key-tag";

const errorKeyGenerationInfo: KeyGenerationInfo = {
  keyTag: KEY_NAME,
  errorCode: "WRONG_KEY_CONFIGURATION",
  userInfo: { message: "More error information" }
};

const keyGenerationInfo: KeyGenerationInfo = {
  keyTag: KEY_NAME,
  keyType: "EC"
};

describe("Test", () => {
  it("Saving error key generation info", async () => {
    const result = await setKeyGenerationInfo(KEY_NAME, errorKeyGenerationInfo);
    expect(result).toBeTruthy();
    const keyGenInfo = await getKeyGenerationInfo(KEY_NAME);
    expect(keyGenInfo?.keyTag).toBe(KEY_NAME);
    expect(keyGenInfo?.errorCode).toBe("WRONG_KEY_CONFIGURATION");
    if (keyGenInfo?.userInfo) {
      expect(keyGenInfo?.userInfo.message).toBe("More error information");
      return;
    }
    expect(false).toBeTruthy();
  });
  it("Saving key generation info", async () => {
    const result = await setKeyGenerationInfo(KEY_NAME, keyGenerationInfo);
    expect(result).toBeTruthy();
    const keyGenInfo = await getKeyGenerationInfo(KEY_NAME);
    expect(keyGenInfo?.keyTag).toBe(KEY_NAME);
    expect(keyGenInfo?.keyType).toBe("EC");
    expect(keyGenInfo?.errorCode).toBe(undefined);
    expect(keyGenInfo?.userInfo).toBe(undefined);
  });
});
