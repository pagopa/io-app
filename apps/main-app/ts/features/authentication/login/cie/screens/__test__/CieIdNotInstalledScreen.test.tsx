import { render } from "@testing-library/react-native";
import CieIdNotInstalledScreen from "../CieIdNotInstalledScreen";
import { withStore } from "../../../../../../utils/jest/withStore";

const mockUseRoute = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useRoute: () => mockUseRoute,
  useNavigation: () => ({
    popToTop: () => jest.fn()
  })
}));

describe(CieIdNotInstalledScreen, () => {
  const CieIdNotInstalledScreenWithStore = withStore(CieIdNotInstalledScreen);

  it("Should match snapshot", () => {
    const component = render(<CieIdNotInstalledScreenWithStore />);
    expect(component).toMatchSnapshot();
  });
});
