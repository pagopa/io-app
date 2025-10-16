import { isEphemeralAARThirdPartyMessage } from "../thirdPartyById";
import { ThirdPartyMessageUnion } from "../../types/thirdPartyById";

describe("isEphemeralAARThirdPartyMessage", () => {
  it("should return true if the message is an ephemeral AAR third party message", () => {
    const message = {
      kind: "AAR"
    } as unknown as ThirdPartyMessageUnion;
    expect(isEphemeralAARThirdPartyMessage(message)).toBe(true);
  });
  it("should return false if the message is not an ephemeral AAR third party message", () => {
    const message = {
      kind: "TPM"
    } as unknown as ThirdPartyMessageUnion;
    expect(isEphemeralAARThirdPartyMessage(message)).toBe(false);
  });
});
