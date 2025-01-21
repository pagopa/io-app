import { render } from "@testing-library/react-native";
import { ItwCredentialStatus } from "../../utils/itwTypesUtils";
import { ItwCredentialCard } from "../ItwCredentialCard";

describe("ItwCredentialCard", () => {
  it.each(["EuropeanHealthInsuranceCard", "EuropeanDisabilityCard", "MDL"])(
    "should match snapshot when credential type is %p",
    type => {
      const component = render(<ItwCredentialCard credentialType={type} />);
      expect(component).toMatchSnapshot();
    }
  );

  it.each([
    "valid",
    "expired",
    "expiring",
    "pending",
    "unknown"
  ] as ReadonlyArray<ItwCredentialStatus>)(
    "should match snapshot when status is %p",
    status => {
      const component = render(
        <ItwCredentialCard credentialType={"MDL"} status={status} />
      );
      expect(component).toMatchSnapshot();
    }
  );
});
