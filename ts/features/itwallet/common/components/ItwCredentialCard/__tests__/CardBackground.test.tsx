import { render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { CredentialType } from "../../../utils/itwMocksUtils";
import { CardColorScheme } from "../types";
import { CardBackground } from "../CardBackground.tsx";
import {
  credentialCardConfigs,
  DEFAULT_CREDENTIAL_CARD_CONFIG,
  getCredentialCardConfig,
  getCredentialBackgroundColor
} from "../credentialCardConfig";

describe("CardBackground", () => {
  it.each([
    ["mDL", "default"],
    ["mDL", "faded"],
    ["mDL", "greyscale"],
    ["EuropeanDisabilityCard", "default"],
    ["EuropeanDisabilityCard", "faded"],
    ["EuropeanDisabilityCard", "greyscale"],
    ["EuropeanHealthInsuranceCard", "default"],
    ["EuropeanHealthInsuranceCard", "faded"],
    ["EuropeanHealthInsuranceCard", "greyscale"],
    ["education_degree", "default"],
    ["education_degree", "faded"],
    ["education_degree", "greyscale"],
    ["education_enrollment", "default"],
    ["education_enrollment", "faded"],
    ["education_enrollment", "greyscale"],
    ["residency", "default"],
    ["residency", "faded"],
    ["residency", "greyscale"],
    ["InvalidCredentialType", "default"]
  ])(
    "should render correctly %s in state %s",
    (credentialType, colorScheme) => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );

      const mockStore = configureMockStore<GlobalState>();
      const store: ReturnType<typeof mockStore> = mockStore({
        ...globalState
      } as GlobalState);

      const component = render(
        <Provider store={store}>
          <CardBackground
            credentialType={credentialType}
            colorScheme={colorScheme as CardColorScheme}
          />
        </Provider>
      ).toJSON();

      expect(component).toMatchSnapshot();
    }
  );
});

describe("credential card config", () => {
  it("should expose static border and title colors for mDL", () => {
    const config = getCredentialCardConfig(CredentialType.DRIVING_LICENSE);
    expect(getCredentialBackgroundColor(config)).toBe("#FADCF5");
    expect(config.borderColor).toBe("#D674A9");
    expect(config.titleColor).toBe("#652035");
  });

  it("should expose static colors for PID", () => {
    const config = getCredentialCardConfig(CredentialType.PID);
    expect(getCredentialBackgroundColor(config)).toBe("#EAF6FF");
    expect(config.titleColor).toBe("#115486");
    expect(config.borderColor).toBe("#4F99E2");
  });

  it("should expose gradient angle and colors for PID", () => {
    const config = getCredentialCardConfig(CredentialType.PID);
    expect(config.background.type).toBe("gradient");
    if (config.background.type === "gradient") {
      expect(config.background.angle).toBe(217);
      expect(config.background.colors).toEqual([
        "#EAF6FF",
        "#F6FBFF",
        "#EAF6FF",
        "#F9F9F9",
        "#EAF6FF"
      ]);
      expect(config.background.positions).toEqual([
        0.0349, 0.2514, 0.4646, 0.7143, 0.9425
      ]);
    }
  });

  it("should return DEFAULT_CREDENTIAL_CARD_CONFIG for unknown credential types", () => {
    expect(getCredentialCardConfig("UnknownType")).toEqual(
      DEFAULT_CREDENTIAL_CARD_CONFIG
    );
  });

  it("should return DEFAULT_CREDENTIAL_CARD_CONFIG for credentials without explicit config", () => {
    const fallbackTypes = [
      CredentialType.EDUCATION_DEGREE,
      CredentialType.EDUCATION_ENROLLMENT,
      CredentialType.RESIDENCY
    ];
    fallbackTypes.forEach(type => {
      expect(getCredentialCardConfig(type)).toEqual(
        DEFAULT_CREDENTIAL_CARD_CONFIG
      );
    });
  });

  it("should have explicit configs for the main credential types", () => {
    const explicitTypes = [
      CredentialType.PID,
      CredentialType.DRIVING_LICENSE,
      CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
      CredentialType.EUROPEAN_DISABILITY_CARD,
      CredentialType.AGE_VERIFICATION
    ];
    explicitTypes.forEach(type => {
      expect(credentialCardConfigs[type]).toBeDefined();
    });
  });
});
