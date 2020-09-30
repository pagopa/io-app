import { createStackNavigator } from "react-navigation";
import IbanInsertionScreen from "../screens/iban/IbanInsertionScreen";
import IbanKOCannotVerify from "../screens/iban/IbanKOCannotVerify";
import IbanKoNotOwned from "../screens/iban/IbanKONotOwned";
import IbanKOWrong from "../screens/iban/IbanKOWrong";
import IbanLoadingUpsert from "../screens/iban/IbanLoadingUpsert";
import BpdInformationScreen from "../screens/onboarding/BpdInformationScreen";
import DeclarationScreen from "../screens/onboarding/declaration/DeclarationScreen";
import { EnrollPaymentMethodsScreen } from "../screens/onboarding/EnrollPaymentMethodsScreen";
import { LoadActivateBpdScreen } from "../screens/onboarding/LoadActivateBpdScreen";
import LoadBpdActivationStatus from "../screens/onboarding/LoadBpdActivationStatus";
import { NoPaymentMethodsAvailableScreen } from "../screens/onboarding/NoPaymentMethodsAvailableScreen";
import BPD_ROUTES from "./routes";

const BpdNavigator = createStackNavigator(
  {
    [BPD_ROUTES.ONBOARDING.LOAD_CHECK_ACTIVATION_STATUS]: {
      screen: LoadBpdActivationStatus
    },
    [BPD_ROUTES.ONBOARDING.INFORMATION_TOS]: {
      screen: BpdInformationScreen
    },
    [BPD_ROUTES.ONBOARDING.DECLARATION]: {
      screen: DeclarationScreen
    },
    [BPD_ROUTES.ONBOARDING.LOAD_ACTIVATE_BPD]: {
      screen: LoadActivateBpdScreen
    },
    [BPD_ROUTES.ONBOARDING.ENROLL_PAYMENT_METHODS]: {
      screen: EnrollPaymentMethodsScreen
    },
    [BPD_ROUTES.ONBOARDING.NO_PAYMENT_METHODS]: {
      screen: NoPaymentMethodsAvailableScreen
    },
    [BPD_ROUTES.IBAN.INSERTION]: {
      screen: IbanInsertionScreen
    },
    [BPD_ROUTES.IBAN.LOADING_UPSERT]: {
      screen: IbanLoadingUpsert
    },
    [BPD_ROUTES.IBAN.KO_CANNOT_VERIFY]: {
      screen: IbanKOCannotVerify
    },
    [BPD_ROUTES.IBAN.KO_NOT_OWNED]: {
      screen: IbanKoNotOwned
    },
    [BPD_ROUTES.IBAN.KO_WRONG]: {
      screen: IbanKOWrong
    }
  },
  {
    // Let each screen handle the header and navigation
    headerMode: "none",
    defaultNavigationOptions: {
      gesturesEnabled: false
    }
  }
);

export default BpdNavigator;
