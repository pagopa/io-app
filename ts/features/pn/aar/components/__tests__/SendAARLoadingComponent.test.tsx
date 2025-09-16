import { render } from "@testing-library/react-native";
import { SendAARLoadingComponent } from "../SendAARLoadingComponent";

describe("SendAARLoadingComponent", () => {
  it("renders the LoadingScreenContent component with the correct testID", () => {
    const { getByTestId } = render(<SendAARLoadingComponent />);
    const loadingContent = getByTestId("LoadingScreenContent");
    expect(loadingContent).toBeTruthy();
  });
});
