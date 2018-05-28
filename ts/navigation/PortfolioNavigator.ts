import { StackNavigator } from "react-navigation";

import ROUTES from "./routes";
import ReceiptPaymentScreen from "../screens/portfolio/ReceiptPaymentScreen";


const PortfolioNavigator = StackNavigator({
  [ROUTES.PORTFOLIO_RECEIPT] : {
      screen: ReceiptPaymentScreen
  }
    

});

export default PortfolioNavigator;