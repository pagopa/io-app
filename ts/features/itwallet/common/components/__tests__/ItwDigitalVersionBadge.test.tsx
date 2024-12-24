import { render } from "@testing-library/react-native";
import { ItwDigitalVersionBadge } from "../ItwDigitalVersionBadge";

describe("ItwDigitalVersionBadge", () => {
  it.each([
    "MDL",
    "EuropeanDisabilityCard",
    "EuropeanHealthInsuranceCard",
    "InvalidCredentialType"
  ])("should render correctly %s", credentialType => {
    const component = render(
      <ItwDigitalVersionBadge credentialType={credentialType} />
    ).toJSON();
    expect(component).toMatchSnapshot();
  });
});
