import { render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { CredentialType } from "../../../utils/itwMocksUtils";
import { CardColorScheme } from "../types";
import {
  CardBackground,
  credentialBackgroundColors,
  credentialBorderColors,
  credentialTitleColors
} from "../CardBackground.tsx";

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

describe("derived card colors", () => {
  it("should derive hue-preserving border and title colors for mDL", () => {
    expect(credentialBackgroundColors[CredentialType.DRIVING_LICENSE]).toBe(
      "#F0CFDF"
    );
    expect(credentialBorderColors.mDL).toBe("#ba7898");
    expect(credentialTitleColors.mDL).toBe("#472636");
  });

  it("should expose the card palette used by the detail header for pid", () => {
    expect(credentialBackgroundColors[CredentialType.PID]).toBe("#EAF6FF");
    expect(credentialTitleColors[CredentialType.PID]).toBe("#115486");
  });
});
