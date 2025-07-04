import { JSX } from "react";
import { LandingCardComponent } from "../../../../components/LandingCardComponent";
import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";

function trackCarouselMessageScreen() {
  void mixpanelTrack(
    "LOGIN_CAROUSEL_2",
    buildEventProperties("UX", "screen_view")
  );
}

function trackCarouselPaymentMethodScreen() {
  void mixpanelTrack(
    "LOGIN_CAROUSEL_3",
    buildEventProperties("UX", "screen_view")
  );
}

function trackCarouselPaymentScreen() {
  void mixpanelTrack(
    "LOGIN_CAROUSEL_4",
    buildEventProperties("UX", "screen_view")
  );
}

export function trackCarousel(
  index: number,
  cards: ReadonlyArray<JSX.Element>
) {
  if (cards[index].type !== LandingCardComponent) {
    return;
  }

  switch (index) {
    case 1: {
      trackCarouselMessageScreen();
      return;
    }
    case 2: {
      trackCarouselPaymentMethodScreen();
      break;
    }
    case 3: {
      trackCarouselPaymentScreen();
      break;
    }
  }
}
