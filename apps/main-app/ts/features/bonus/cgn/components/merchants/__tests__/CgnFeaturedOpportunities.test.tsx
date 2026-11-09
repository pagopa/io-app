import { render } from "@testing-library/react-native";
import I18n from "i18next";

import {
  CgnFeaturedOpportunities,
  FeaturedOpportunity
} from "../CgnFeaturedOpportunities";

const makeOpportunity = (index: number): FeaturedOpportunity => ({
  id: `opportunity-${index}`,
  title: `Partner ${index}`,
  description: `Description ${index}`
});

describe("CgnFeaturedOpportunities", () => {
  it("renders nothing when there are no opportunities", () => {
    const { queryByTestId } = render(
      <CgnFeaturedOpportunities opportunities={[]} />
    );

    expect(queryByTestId("CgnFeaturedOpportunities")).toBeNull();
  });

  it("renders the section title and the opportunities", () => {
    const { getByTestId, getByText } = render(
      <CgnFeaturedOpportunities opportunities={[makeOpportunity(1)]} />
    );

    expect(getByTestId("CgnFeaturedOpportunities")).toBeTruthy();
    expect(
      getByText(I18n.t("bonus.cgn.merchantsList.featuredOpportunities.title"))
    ).toBeTruthy();
    expect(getByText("Partner 1")).toBeTruthy();
    expect(getByText("Description 1")).toBeTruthy();
  });

  it("renders at most 3 opportunities", () => {
    const opportunities = [1, 2, 3, 4, 5].map(makeOpportunity);

    const { getByText, queryByText } = render(
      <CgnFeaturedOpportunities opportunities={opportunities} />
    );

    expect(getByText("Partner 1")).toBeTruthy();
    expect(getByText("Partner 2")).toBeTruthy();
    expect(getByText("Partner 3")).toBeTruthy();
    expect(queryByText("Partner 4")).toBeNull();
    expect(queryByText("Partner 5")).toBeNull();
  });
});
