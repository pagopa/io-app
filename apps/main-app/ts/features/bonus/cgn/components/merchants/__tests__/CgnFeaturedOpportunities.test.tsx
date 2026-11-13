import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { fireEvent, render } from "@testing-library/react-native";
import I18n from "i18next";

import { ResolvedCgnFeaturedOpportunity } from "../../../store/actions/merchants";
import { CgnFeaturedOpportunities } from "../CgnFeaturedOpportunities";

const makeOpportunity = (index: number): ResolvedCgnFeaturedOpportunity => ({
  merchant: {
    id: `merchant-${index}` as NonEmptyString,
    name: `Partner ${index}` as NonEmptyString,
    discounts: [],
    allNationalAddresses: false
  },
  discount: {
    id: `discount-${index}` as NonEmptyString,
    name: `Description ${index}` as NonEmptyString,
    startDate: new Date("2020-01-01"),
    endDate: new Date("2099-12-31"),
    productCategories: []
  }
});

describe("CgnFeaturedOpportunities", () => {
  afterEach(() => jest.restoreAllMocks());

  test.each([
    {
      name: "no configured opportunities",
      isLoading: false,
      hasConfiguredOpportunities: false,
      showSkeleton: false
    },
    {
      name: "loading without configured opportunities",
      isLoading: true,
      hasConfiguredOpportunities: false,
      showSkeleton: false
    },
    {
      name: "loading configured opportunities",
      isLoading: true,
      hasConfiguredOpportunities: true,
      showSkeleton: true
    },
    {
      name: "no available configured opportunities",
      isLoading: false,
      hasConfiguredOpportunities: true,
      showSkeleton: false
    }
  ])(
    "handles $name",
    ({ isLoading, hasConfiguredOpportunities, showSkeleton }) => {
      const { queryByTestId } = render(
        <CgnFeaturedOpportunities
          hasConfiguredOpportunities={hasConfiguredOpportunities}
          isLoading={isLoading}
          onSelect={jest.fn()}
          opportunities={[]}
        />
      );

      expect(queryByTestId("CgnFeaturedOpportunities")).toBeNull();
      expect(!!queryByTestId("CgnFeaturedOpportunitiesSkeleton")).toBe(
        showSkeleton
      );
    }
  );

  test.each([
    { name: "loaded", isLoading: false },
    { name: "refreshing", isLoading: true }
  ])(
    "renders the section title and the opportunities when $name",
    ({ isLoading }) => {
      const { getByTestId, getByText, queryByTestId } = render(
        <CgnFeaturedOpportunities
          hasConfiguredOpportunities
          isLoading={isLoading}
          onSelect={jest.fn()}
          opportunities={[makeOpportunity(1)]}
        />
      );

      expect(getByTestId("CgnFeaturedOpportunities")).toBeTruthy();
      expect(queryByTestId("CgnFeaturedOpportunitiesSkeleton")).toBeNull();
      expect(
        getByText(I18n.t("bonus.cgn.merchantsList.featuredOpportunities.title"))
      ).toBeTruthy();
      expect(getByText("Partner 1")).toBeTruthy();
      expect(getByText("Description 1")).toBeTruthy();
    }
  );

  it("renders at most 3 opportunities", () => {
    const opportunities = [1, 2, 3, 4, 5].map(makeOpportunity);

    const { getByText, queryByText } = render(
      <CgnFeaturedOpportunities
        hasConfiguredOpportunities
        isLoading={false}
        onSelect={jest.fn()}
        opportunities={opportunities}
      />
    );

    expect(getByText("Partner 1")).toBeTruthy();
    expect(getByText("Partner 2")).toBeTruthy();
    expect(getByText("Partner 3")).toBeTruthy();
    expect(queryByText("Partner 4")).toBeNull();
    expect(queryByText("Partner 5")).toBeNull();
  });

  it.each([
    {
      name: "uses the opportunity description when available",
      description: "Save 20% on your purchase" as NonEmptyString,
      expected: "Save 20% on your purchase"
    },
    {
      name: "falls back to the opportunity name when the description is missing",
      description: undefined,
      expected: "Description 1"
    }
  ])("$name", ({ description, expected }) => {
    const opportunity = makeOpportunity(1);
    const onSelect = jest.fn();
    const resolvedOpportunity = {
      ...opportunity,
      discount: { ...opportunity.discount, description }
    };
    const { getByText, getByRole } = render(
      <CgnFeaturedOpportunities
        hasConfiguredOpportunities
        isLoading={false}
        onSelect={onSelect}
        opportunities={[resolvedOpportunity]}
      />
    );

    expect(getByText(expected).props.numberOfLines).toBe(1);
    fireEvent.press(getByRole("button", { name: `Partner 1. ${expected}` }));
    expect(onSelect).toHaveBeenCalledWith(resolvedOpportunity);
  });

  it("selects the resolved merchant and discount when pressed", () => {
    const onSelect = jest.fn();
    const opportunity = makeOpportunity(1);
    const { getByLabelText } = render(
      <CgnFeaturedOpportunities
        hasConfiguredOpportunities
        isLoading={false}
        onSelect={onSelect}
        opportunities={[opportunity]}
      />
    );

    fireEvent.press(getByLabelText("Partner 1. Description 1"));

    expect(onSelect).toHaveBeenCalledWith(opportunity);
    expect(
      getByLabelText("Partner 1. Description 1").props.accessibilityRole
    ).toBe("button");
  });
});
