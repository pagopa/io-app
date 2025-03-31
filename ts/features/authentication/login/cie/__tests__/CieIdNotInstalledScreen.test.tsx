import { render } from "@testing-library/react-native";
import CieIdNotInstalledScreen from "../screens/CieIdNotInstalledScreen";

const mockUseRoute = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useRoute: () => mockUseRoute,
  useNavigation: () => ({
    popToTop: () => jest.fn()
  })
}));

describe(CieIdNotInstalledScreen, () => {
  it("Should match snapshot", () => {
    const component = render(<CieIdNotInstalledScreen />);
    expect(component).toMatchSnapshot();
  });
});
