import { ComponentProps } from "react";
import { createStore } from "redux";
import { ScrollView } from "react-native";
import { fireEvent } from "@testing-library/react-native";
import { Carousel, CarouselProps } from "../Carousel";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { trackCarousel } from "../../analytics/carouselAnalytics";
import { LandingCardComponent } from "../../../../../components/LandingCardComponent";

jest.mock("../../analytics/carouselAnalytics", () => ({
  trackCarousel: jest.fn()
}));

describe("Carousel", () => {
  const carouselCards: ReadonlyArray<
    ComponentProps<typeof LandingCardComponent>
  > = [
    {
      id: 0,
      pictogramName: "hello",
      title: "Card 0",
      content: "Card 0 content",
      accessibilityLabel: "Card 0 a11y",
      accessibilityHint: "Card 0 a11y hint"
    },
    {
      id: 1,
      pictogramName: "attention",
      title: "Card 1",
      content: "Card 1 content",
      accessibilityLabel: "Card 1 a11y",
      accessibilityHint: "Card 1 a11y hint"
    },
    {
      id: 2,
      pictogramName: "activate",
      title: "Card 2",
      content: "Card 2 content",
      accessibilityLabel: "Card 2 a11y",
      accessibilityHint: "Card 2 a11y hint"
    }
  ];
  it("renders carousel cards", () => {
    const { getByText } = renderComponent({ carouselCards });
    expect(getByText("Card 0")).toBeTruthy();
    expect(getByText("Card 1")).toBeTruthy();
    expect(getByText("Card 2")).toBeTruthy();
  });

  it("triggers trackCarousel on scroll end drag", () => {
    const { UNSAFE_getByType } = renderComponent({ carouselCards });

    const scrollView = UNSAFE_getByType(ScrollView);

    scrollView.props.onScrollEndDrag({
      nativeEvent: {
        contentOffset: { x: 375 },
        layoutMeasurement: { width: 375 }
      }
    });

    expect(trackCarousel).toHaveBeenCalled();
  });

  it("calls dotEasterEggCallback after 3 taps", () => {
    const callback = jest.fn();
    const { getByTestId } = renderComponent({
      carouselCards,
      dotEasterEggCallback: callback
    });

    const dotsContainer = getByTestId("carousel-dots");

    fireEvent(dotsContainer, "touchEnd");
    fireEvent(dotsContainer, "touchEnd");
    fireEvent(dotsContainer, "touchEnd");

    expect(callback).toHaveBeenCalled();
  });
});

const renderComponent = (props: CarouselProps) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <Carousel {...props} />,
    "DUMMY",
    {},
    store
  );
};
