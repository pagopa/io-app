import { CgnFeaturedOpportunity } from "@io-app/api-types/generated/definitions/content/CgnFeaturedOpportunity";
import { fireEvent, render } from "@testing-library/react-native";
import I18n from "i18next";

import * as urlUtils from "../../../../../../utils/url";
import { CgnFeaturedOpportunities } from "../CgnFeaturedOpportunities";

const makeOpportunity = (index: number): CgnFeaturedOpportunity => ({
  partnerName: `Partner ${index}`,
  description: `Description ${index}`
});

describe("CgnFeaturedOpportunities", () => {
  afterEach(() => jest.restoreAllMocks());

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

  it("opens the configured opportunity URL", () => {
    const openWebUrlSpy = jest
      .spyOn(urlUtils, "openWebUrl")
      .mockImplementation();
    const opportunity = {
      ...makeOpportunity(1),
      ctaUrl: "https://example.com/opportunity"
    };
    const { getByLabelText } = render(
      <CgnFeaturedOpportunities opportunities={[opportunity]} />
    );

    fireEvent.press(getByLabelText("Partner 1. Description 1"));

    expect(openWebUrlSpy).toHaveBeenCalledWith(opportunity.ctaUrl);
  });

  it("disables the card when the opportunity has no CTA URL", () => {
    const openWebUrlSpy = jest
      .spyOn(urlUtils, "openWebUrl")
      .mockImplementation();
    const { getByLabelText } = render(
      <CgnFeaturedOpportunities opportunities={[makeOpportunity(1)]} />
    );

    expect(
      getByLabelText("Partner 1. Description 1").props.accessibilityState
    ).toMatchObject({ disabled: true });
    fireEvent.press(getByLabelText("Partner 1. Description 1"));

    expect(openWebUrlSpy).not.toHaveBeenCalled();
  });
});
