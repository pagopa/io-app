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
  }
})

export default PortfolioNavigator
