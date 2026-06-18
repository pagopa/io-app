import { render } from "@testing-library/react-native";
import { ProgressBar } from "../ProgressBar";

describe("ProgressBar", () => {
  it("should render correctly with 0% progress", () => {
    const { getByTestId } = render(<ProgressBar progressPercentage={0} />);
    const progressBar = getByTestId("progressBar");
    expect(progressBar.props.style.width).toBe("1%");
  });

  it("should render correctly with 50% progress", () => {
    const { getByTestId } = render(<ProgressBar progressPercentage={0.5} />);
    const progressBar = getByTestId("progressBar");
    expect(progressBar.props.style.width).toBe("50%");
  });

  it("should render correctly with 100% progress", () => {
    const { getByTestId } = render(<ProgressBar progressPercentage={1} />);
    const progressBar = getByTestId("progressBar");
    expect(progressBar.props.style.width).toBe("100%");
  });

  it("should clamp percentage to a maximum of 100%", () => {
    const { getByTestId } = render(<ProgressBar progressPercentage={1.5} />);
    const progressBar = getByTestId("progressBar");
    expect(progressBar.props.style.width).toBe("100%");
  });

  it("should clamp percentage to a minimum of 0%", () => {
    const { getByTestId } = render(<ProgressBar progressPercentage={-0.5} />);
    const progressBar = getByTestId("progressBar");
    expect(progressBar.props.style.width).toBe("1%");
  });
});
