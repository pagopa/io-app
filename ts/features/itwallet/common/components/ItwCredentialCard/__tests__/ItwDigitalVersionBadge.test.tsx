import { render } from "@testing-library/react-native";
import { ItwDigitalVersionBadge } from "../ItwDigitalVersionBadge";
import { CardColorScheme } from "../types";

describe("ItwDigitalVersionBadge", () => {
  it.each([
    ["MDL", "default"],
    ["MDL", "faded"],
    ["MDL", "greyscale"],
    ["EuropeanDisabilityCard", "default"],
    ["EuropeanDisabilityCard", "faded"],
    ["EuropeanDisabilityCard", "greyscale"],
    ["EuropeanHealthInsuranceCard", "default"],
    ["EuropeanHealthInsuranceCard", "faded"],
    ["EuropeanHealthInsuranceCard", "greyscale"],
    ["InvalidCredentialType", "default"]
  ])(
    "should render correctly %s in state %s",
    (credentialType, colorScheme) => {
      const component = render(
        <ItwDigitalVersionBadge
          credentialType={credentialType}
          colorScheme={colorScheme as CardColorScheme}
        />
      ).toJSON();
      expect(component).toMatchSnapshot();
    }
  );
});
