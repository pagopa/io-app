/* eslint-disable @typescript-eslint/ban-ts-comment */
import { render } from "@testing-library/react-native";
import { Linking } from "react-native";
import CieIdLoginScreen from "../CieIdLoginScreen";
import { withStore } from "../../../../../../utils/jest/withStore";

const TestComponent = withStore(CieIdLoginScreen);
const mockUseRoute = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useRoute: () => mockUseRoute,
  useNavigation: () => ({
    replace: jest.fn()
  })
}));

jest.mock("../../../../../../hooks/useHeaderSecondLevel", () => ({
  useHeaderSecondLevel: jest.fn()
}));

describe(CieIdLoginScreen, () => {
  jest
    .spyOn(Linking, "addEventListener")
    // @ts-ignore
    .mockReturnValue({ remove: jest.fn() });

  it("Should match snapshot", () => {
    const component = render(<TestComponent />);
    expect(component).toMatchSnapshot();
  });
});
