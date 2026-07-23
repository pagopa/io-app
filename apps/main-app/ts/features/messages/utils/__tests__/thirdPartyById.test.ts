import { ThirdPartyMessageUnion } from "../../types/thirdPartyById";
import { isEphemeralAarThirdPartyMessage } from "../thirdPartyById";

describe("isEphemeralAarThirdPartyMessage", () => {
  it("should return true if the message is an ephemeral AAR third party message", () => {
    const message = {
      kind: "AAR"
    } as unknown as ThirdPartyMessageUnion;
    expect(isEphemeralAarThirdPartyMessage(message)).toBe(true);
  });
  it("should return false if the message is not an ephemeral Aar third party message", () => {
    const message = {
      kind: "TPM"
    } as unknown as ThirdPartyMessageUnion;
    expect(isEphemeralAarThirdPartyMessage(message)).toBe(false);
  });
});
