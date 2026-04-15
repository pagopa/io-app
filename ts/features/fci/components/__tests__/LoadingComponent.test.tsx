import { render } from "@testing-library/react-native";
import LoadingComponent from "../LoadingComponent";

type Props = {
  captionTitle?: string;
  captionSubtitle?: string;
};

describe("Test LoadingComponent component", () => {
  it("should render a LoadingComponent component with props correctly", () => {
    const props = {
      captionTitle: "Loading",
      captionSubtitle: "Please wait..."
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(component).toMatchSnapshot();
  });
  it("should render a LoadingComponent component with the right caption title", () => {
    const props = {
      captionTitle: "Loading",
      captionSubtitle: "Please wait..."
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(
      component.queryByTestId("LoadingSpinnerCaptionTitleID")
    ).toBeTruthy();
    expect(component.queryByText("Loading")).toBeTruthy();
  });
  it("should render a LoadingComponent component with the right caption subTitle", () => {
    const props = {
      captionTitle: "Loading",
      captionSubtitle: "Please wait..."
    };
    const component = renderComponent({ ...props });
    expect(component).toBeTruthy();
    expect(
      component.queryByTestId("LoadingSpinnerCaptionSubTitleID")
    ).toBeTruthy();
    expect(component.queryByText("Please wait...")).toBeTruthy();
  });
});

const renderComponent = (props: Props) =>
  render(<LoadingComponent {...props} />);
