import { CredentialType } from "../itwMocksUtils";
import { getThemeColorByCredentialType } from "../itwStyleUtils";

describe("getThemeColorByCredentialType", () => {
  it("should keep the legacy mDL theme when L3 is disabled", () => {
    expect(
      getThemeColorByCredentialType(
        CredentialType.DRIVING_LICENSE,
        false
      )
    ).toEqual({
      backgroundColor: "#744C63",
      textColor: "#652035",
      statusBarStyle: "light-content",
      variant: "contrast"
    });
  });

  it("should use the redesigned PID palette when L3 is enabled", () => {
    expect(
      getThemeColorByCredentialType(CredentialType.PID, true)
    ).toEqual({
      backgroundColor: "#EAF6FF",
      textColor: "#115486",
      statusBarStyle: "dark-content",
      variant: "neutral"
    });
  });
});
