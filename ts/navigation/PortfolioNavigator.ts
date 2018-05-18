import { StackNavigator } from "react-navigation";

import ROUTES from "./routes";
import { QRcameraAcquisitionScreen } from '../screens/portfolio/QRcameraAcquisitionScreen';
import { QRmanualAcquisitionScreen} from '../screens/portfolio/QRmanualAcquisitionScreen';
import { PaymentNoticeSummaryScreen } from '../screens/portfolio/PaymentNoticeSummaryScreen';

const PortfolioNavigator = StackNavigator({
  [ROUTES.PORTFOLIO_ACQUIRE_QRCODE]: {
    screen: QRcameraAcquisitionScreen
  },
  [ROUTES.PORTFOLIO_INSERT_QRCODE_DATA]: {
    screen: QRmanualAcquisitionScreen
  },
  [ROUTES.PORTFOLIO_PAYMENT_SUMMARY]: {
    screen: PaymentNoticeSummaryScreen
  }
});

export default PortfolioNavigator;