import { StackNavigator } from "react-navigation";

import IdpLoginScreen from "../screens/authentication/IdpLoginScreen";
import IdpSelectionScreen from "../screens/authentication/IdpSelectionScreen";
import LandingScreen from "../screens/authentication/LandingScreen";
import SpidInformationRequestScreen from "../screens/authentication/SpidInformationRequestScreen";
import ROUTES from "./routes";

import QRcameraAcquisitionScreen from "../screens/portfolio/QRcameraAcquisitionScreen";
import QRmanualAcquisitionScreen from "../screens/portfolio/QRmanualAcquisitionScreen";
import PaymentNoticeSummaryScreen from "../screens/portfolio/PaymentNoticeSummaryScreen";
import RequireConfirmPaymentScreen from "../screens/portfolio/RequireConfirmPaymentScreen";

/**
 * The authentication related stack of screens of the application.
 */
const navigator = StackNavigator(
  {
    [ROUTES.AUTHENTICATION_LANDING]: {
      screen: LandingScreen
    },
    [ROUTES.AUTHENTICATION_IDP_SELECTION]: {
      screen: IdpSelectionScreen
    },
    [ROUTES.AUTHENTICATION_IDP_LOGIN]: {
      screen: IdpLoginScreen
    },
    [ROUTES.AUTHENTICATION_SPID_INFORMATION_REQUEST]: {
      screen: SpidInformationRequestScreen
    },
    [ROUTES.PORTFOLIO_ACQUIRE_QRCODE] : {
      screen: QRcameraAcquisitionScreen
    },
    [ROUTES.PORTFOLIO_INSERT_QRCODE_DATA] : {
      screen: QRmanualAcquisitionScreen
    },
    [ROUTES.PORTFOLIO_PAYMENT_SUMMARY] : {
      screen: PaymentNoticeSummaryScreen
    },
    [ROUTES.PORTFOLIO_ASK_CONFIRM_PAYMENT]: {
      screen: RequireConfirmPaymentScreen
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none"
  }
  
);

export default navigator;
