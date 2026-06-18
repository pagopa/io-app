import { render } from "@testing-library/react-native";
import { ReceiptLoadingList } from "../ReceiptLoadingList";

describe("ReceiptLoadingList", () => {
  it("should render section title skeleton when showSectionTitleSkeleton is true", () => {
    const { getByTestId } = render(
      <ReceiptLoadingList showSectionTitleSkeleton={true} />
    );

    expect(getByTestId("section-title-skeleton")).toBeTruthy();
  });

  it("should not render section title skeleton when showSectionTitleSkeleton is false", () => {
    const { queryByTestId } = render(
      <ReceiptLoadingList showSectionTitleSkeleton={false} />
    );

    expect(queryByTestId("section-title-skeleton")).toBeNull();
  });
});
