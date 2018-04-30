/**
 * CITTADINANZA DIGITALE
 * io.italia.it
 *
 * @flow
 */

import { StackNavigator } from 'react-navigation'
import ROUTES from './routes'
import PortfolioHomeScreen from '../screens/portfolio/PortfolioHomeScreen'
import OperationDetailsScreen from '../screens/portfolio/OperationDetailsScreen'
import CreditCardsScreen from '../screens/portfolio/CreditCardsScreen'
import TransactionsScreen from '../screens/portfolio/TransactionsScreen'
import SaveNewCardScreen from '../screens/portfolio/SaveNewCardScreen'
import AddPaymentMethodScreen from '../screens/portfolio/AddPaymentMethodScreen';
import AddCardScreen from '../screens/portfolio/AddCardScreen';

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
<<<<<<< HEAD
  [ROUTES.PORTFOLIO_SAVE_CARD]: {
    screen: SaveNewCardScreen
=======
  [ROUTES.PORTFOLIO_ADD_PAYMENT_METHOD]: {
    screen: AddPaymentMethodScreen
  },
  [ROUTES.PORTFOLIO_ADD_CARD]: {
    screen: AddCardScreen
>>>>>>> 1d255b00ee2e532e4d9c71553b764eef74971639
  }
})

export default PortfolioNavigator
