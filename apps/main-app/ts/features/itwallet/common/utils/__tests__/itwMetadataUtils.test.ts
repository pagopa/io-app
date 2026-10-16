import { getForcedItwAuthSource } from "../itwMetadataUtils";
import { CredentialType } from "../itwMocksUtils";

describe("getForcedItwAuthSource", () => {
  it("forces the 'IT Wallet' data source for the proof_of_age credential", () => {
    expect(getForcedItwAuthSource(CredentialType.PROOF_OF_AGE)).toBe(
      "IT-Wallet ID"
    );
  });

  it.each([
    CredentialType.PID,
    CredentialType.DRIVING_LICENSE,
    CredentialType.EUROPEAN_DISABILITY_CARD,
    "unknown_credential"
  ])("returns undefined for %s", credentialType => {
    expect(getForcedItwAuthSource(credentialType)).toBeUndefined();
  });
});
