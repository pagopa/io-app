import { render } from "@testing-library/react-native";
import { CgnMerchantListSkeleton } from "../CgnMerchantListSkeleton";

describe("CgnMerchantListSkeleton", () => {
  it("should render the correct number of skeleton items", () => {
    const { getAllByTestId } = render(
      <CgnMerchantListSkeleton count={3} hasIcons />
    );
    const items = getAllByTestId(/CgnMerchantListSkeleton-Item-/);
    expect(items.length).toBe(3);
  });

  it("should render the default number of skeleton items", () => {
    const { getAllByTestId } = render(<CgnMerchantListSkeleton />);
    const items = getAllByTestId(/CgnMerchantListSkeleton-Item-/);
    expect(items.length).toBe(6);
  });

  it("should render placeholders with correct testID", () => {
    const { getByTestId } = render(<CgnMerchantListSkeleton count={1} />);
    const placeholder = getByTestId("CgnMerchantListSkeleton-Placeholder-0");
    expect(placeholder).toBeTruthy();
  });
});
