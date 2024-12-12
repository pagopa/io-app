import { render } from "@testing-library/react-native";
import * as React from "react";
import { PaymentsBizEventsTransactionLoadingList } from "../PaymentsBizEventsTransactionLoadingList";

describe("PaymentsBizEventsTransactionLoadingList", () => {
  it("should render section title skeleton when showSectionTitleSkeleton is true", () => {
    const { getByTestId } = render(
      <PaymentsBizEventsTransactionLoadingList
        showSectionTitleSkeleton={true}
      />
    );

    expect(getByTestId("section-title-skeleton")).toBeTruthy();
  });

  it("should not render section title skeleton when showSectionTitleSkeleton is false", () => {
    const { queryByTestId } = render(
      <PaymentsBizEventsTransactionLoadingList
        showSectionTitleSkeleton={false}
      />
    );

    expect(queryByTestId("section-title-skeleton")).toBeNull();
  });
});
