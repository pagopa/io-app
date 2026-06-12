import { CredentialType } from "../itwMocksUtils";
import { getThemeColorByCredentialType } from "../itwStyleUtils";

describe("getThemeColorByCredentialType", () => {
  describe.each(["light", "dark"] as const)(
    "when color scheme is %s",
    colorScheme => {
      describe.each([true, false])("when L3 is [%s]", isL3 => {
        it.each([
          CredentialType.PID,
          CredentialType.DRIVING_LICENSE,
          CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
          CredentialType.EUROPEAN_DISABILITY_CARD
        ])(
          "should match the snapshot for [%s] when L3 is enabled",
          credentialType => {
            expect(
              getThemeColorByCredentialType(credentialType, isL3, colorScheme)
            ).toMatchSnapshot();
          }
        );
      });
    }
  );
});
