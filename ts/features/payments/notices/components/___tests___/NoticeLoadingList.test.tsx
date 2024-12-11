import { render } from "@testing-library/react-native";
import * as React from "react";
import { NoticeLoadingList } from "../NoticeLoadingList";

describe("NoticeLoadingList", () => {
  it("should render section title skeleton when showSectionTitleSkeleton is true", () => {
    const { getByTestId } = render(
      <NoticeLoadingList showSectionTitleSkeleton={true} />
    );

    expect(getByTestId("section-title-skeleton")).toBeTruthy();
  });

  it("should not render section title skeleton when showSectionTitleSkeleton is false", () => {
    const { queryByTestId } = render(
      <NoticeLoadingList showSectionTitleSkeleton={false} />
    );

    expect(queryByTestId("section-title-skeleton")).toBeNull();
  });
});
