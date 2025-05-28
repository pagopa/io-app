import { render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { DigitalVersionBadge } from "../DigitalVersionBadge";
import { CardColorScheme } from "../types";

describe("DigitalVersionBadge", () => {
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
          <DigitalVersionBadge
            credentialType={credentialType}
            colorScheme={colorScheme as CardColorScheme}
          />
        </Provider>
      ).toJSON();

      expect(component).toMatchSnapshot();
    }
  );
});
