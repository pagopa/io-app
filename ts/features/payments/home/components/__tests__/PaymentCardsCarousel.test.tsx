import { within } from "@testing-library/react-native";
import { createStore } from "redux";
import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import {
  PaymentCardsCarousel,
  PaymentCardsCarouselProps
} from "../PaymentsCardsCarousel";

const onPress = () => undefined;

const cardsDataForCarousel: PaymentCardsCarouselProps = {
  cards: [
    {
      hpan: "9900",
      brand: "maestro",
      onPress,
      testID: "card-1"
    },
    {
      holderEmail: "test@test.it",
      onPress,
      testID: "card-2",
      isExpired: true
    },
    {
      holderPhone: "1234",
      onPress,
      testID: "card-3"
    }
  ]
};

describe("PaymentCardsCarousel", () => {
  it("should render cards", () => {
    const { queryByTestId } = renderComponent(cardsDataForCarousel);

    expect(queryByTestId("card-1")).not.toBeNull();
    expect(
      within(queryByTestId("card-1")!).queryByText("•••• 9900")
    ).not.toBeNull();
    expect(
      within(queryByTestId("card-2")!).queryByTestId("card-1-errorIcon")
    ).toBeNull();

    expect(queryByTestId("card-2")).not.toBeNull();
    expect(
      within(queryByTestId("card-2")!).queryByText("PayPal")
    ).not.toBeNull();
    expect(
      within(queryByTestId("card-2")!).queryByTestId("card-2-errorIcon")
    ).not.toBeNull();

    expect(queryByTestId("card-3")).not.toBeNull();
    expect(
      within(queryByTestId("card-3")!).queryByText("BANCOMAT Pay")
    ).not.toBeNull();
    expect(
      within(queryByTestId("card-3")!).queryByTestId("card-3-errorIcon")
    ).toBeNull();
  });
});

function renderComponent(props: PaymentCardsCarouselProps) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <PaymentCardsCarousel {...props} />,
    ROUTES.WALLET_HOME,
    {},
    createStore(appReducer, globalState as any)
  );
}
