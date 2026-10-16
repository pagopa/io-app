import { render } from "@testing-library/react-native";

import { withStore } from "../../../../../../utils/jest/withStore";
import CieIdNotInstalledScreen from "../CieIdNotInstalledScreen";

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
