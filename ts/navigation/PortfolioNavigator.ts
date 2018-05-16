import { StackNavigator } from "react-navigation";
import { AddCardScreen } from "../screens/portfolio/AddCardScreen";
import { AddPaymentMethodScreen } from "../screens/portfolio/AddPaymentMethodScreen";
import { CreditCardsScreen } from "../screens/portfolio/CreditCardsScreen";
import { OperationDetailsScreen } from "../screens/portfolio/OperationDetailsScreen";
import { PortfolioHomeScreen } from "../screens/portfolio/PortfolioHomeScreen";
import { SaveNewCardScreen } from "../screens/portfolio/SaveNewCardScreen";
import { TransactionsScreen } from "../screens/portfolio/TransactionsScreen";
import ROUTES from "./routes";

const PortfolioNavigator = StackNavigator({
  [ROUTES.PORTFOLIO_HOME]: {
    screen: PortfolioHomeScreen
  },
  [ROUTES.PORTFOLIO_OPERATION_DETAILS]: {
    screen: OperationDetailsScreen
  },
  [ROUTES.PORTFOLIO_CREDITCARDS]: {
    screen: CreditCardsScreen
  },
  [ROUTES.PORTFOLIO_CARDS_OPERATIONS]: {
    screen: TransactionsScreen
  },
  [ROUTES.PORTFOLIO_SAVE_CARD]: {
    screen: SaveNewCardScreen
  },
  [ROUTES.PORTFOLIO_ADD_PAYMENT_METHOD]: {
    screen: AddPaymentMethodScreen
  },
  [ROUTES.PORTFOLIO_ADD_CARD]: {
    screen: AddCardScreen
  }
});

export default PortfolioNavigator;
