import { render } from "@testing-library/react-native";
import { ServicesHeaderSection } from "../ServicesHeaderSection";

jest.mock("@react-navigation/elements", () => ({
  useHeaderHeight: jest.fn().mockImplementation(() => 200)
}));

describe("ServicesHeaderSection component", () => {
  it("should match snapshot for loading", () => {
    const component = render(<ServicesHeaderSection isLoading={true} />);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match the snapshot for service header", () => {
    const component = render(
      <ServicesHeaderSection
        logoUri={require("../../../../../../img/test/logo.png")}
        subTitle={"#### subTitle ####"}
        title={"#### title ####"}
      />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});
