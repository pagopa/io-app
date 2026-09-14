import { JSX } from "react";
import { Text } from "react-native";

import { LandingCardComponent } from "../../../../../components/LandingCardComponent";
import { mixpanelTrack } from "../../../../../mixpanel";
import { trackCarousel } from "../carouselAnalytics";

jest.mock("../../../../../mixpanel", () => ({
  mixpanelTrack: jest.fn()
}));

describe("trackCarousel", () => {
  const createLandingCard = (key: string) => (
    <LandingCardComponent
      accessibilityLabel={"label"}
      content={"content"}
      id={0}
      key={key}
      pictogramName={"hello"}
      title={"title"}
    />
  );

  const cards: ReadonlyArray<JSX.Element> = [
    createLandingCard("0"),
    createLandingCard("1"),
    createLandingCard("2"),
    createLandingCard("3")
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should track LOGIN_CAROUSEL_2 when index is 1", () => {
    trackCarousel(1, cards);
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_CAROUSEL_2",
      expect.objectContaining({
        event_category: "UX",
        event_type: "screen_view"
      })
    );
  });

  it("should track LOGIN_CAROUSEL_3 when index is 2", () => {
    trackCarousel(2, cards);
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_CAROUSEL_3",
      expect.objectContaining({
        event_category: "UX",
        event_type: "screen_view"
      })
    );
  });

  it("should track LOGIN_CAROUSEL_4 when index is 3", () => {
    trackCarousel(3, cards);
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_CAROUSEL_4",
      expect.objectContaining({
        event_category: "UX",
        event_type: "screen_view"
      })
    );
  });

  it("should not track if the component is not a LandingCardComponent", () => {
    const fakeCard = <Text key="fake">Fake</Text>;
    const fakeCards = [fakeCard, fakeCard, fakeCard];
    trackCarousel(0, fakeCards);
    expect(mixpanelTrack).not.toHaveBeenCalled();
  });
});
