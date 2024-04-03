import { ListItemHeader } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { WalletInfo } from "../../../../../definitions/pagopa/ecommerce/WalletInfo";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { paymentsGetPaymentUserMethodsAction } from "../../checkout/store/actions/networking";
import { walletPaymentUserWalletsSelector } from "../../checkout/store/selectors";
import { PaymentCardSmallProps } from "../../common/components/PaymentCardSmall";
import { PaymentsMethodDetailsRoutes } from "../../details/navigation/routes";
import { UIWalletInfoDetails } from "../../details/types/UIWalletInfoDetails";
import { PaymentsOnboardingRoutes } from "../../onboarding/navigation/routes";
import { selectPaymentsTransactions } from "../store/selectors";
import {
  PaymentCardsCarousel,
  PaymentCardsCarouselSkeleton
} from "./PaymentsCardsCarousel";

const PaymentsUserMethodsList = () => {
  const navigation = useIONavigation();
  const dispatch = useIODispatch();

  const paymentMethodsPot = useIOSelector(walletPaymentUserWalletsSelector);
  const transactionsPot = useIOSelector(selectPaymentsTransactions);

  const isLoading =
    pot.isLoading(paymentMethodsPot) || pot.isLoading(transactionsPot);
  const methods = pot.getOrElse(paymentMethodsPot, []);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(paymentsGetPaymentUserMethodsAction.request());
    }, [dispatch])
  );

  const handleOnMethodPress = (walletId: string) => () => {
    navigation.navigate(
      PaymentsMethodDetailsRoutes.PAYMENT_METHOD_DETAILS_NAVIGATOR,
      {
        screen: PaymentsMethodDetailsRoutes.PAYMENT_METHOD_DETAILS_SCREEN,
        params: {
          walletId
        }
      }
    );
  };

  const handleOnAddMethodPress = () => {
    navigation.navigate(PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_NAVIGATOR, {
      screen: PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_SELECT_METHOD
    });
  };

  const userMethods = methods.map(
    (
      // this function is here to allow future navigation usage
      method: WalletInfo
    ): PaymentCardSmallProps => {
      const details = method.details as UIWalletInfoDetails;

      return {
        onPress: handleOnMethodPress(method.walletId),
        abiCode: details.abi,
        brand: details.brand,
        bankName: details.bankName,
        holderEmail: details.maskedEmail,
        holderPhone: details.maskedNumber,
        hpan: details.lastFourDigits
      };
    }
  );

  return (
    <>
      <ListItemHeader
        label={I18n.t("payment.homeScreen.methodsSection.header")}
        accessibilityLabel={I18n.t("payment.homeScreen.methodsSection.header")}
        endElement={{
          type: "buttonLink",
          componentProps: {
            label: I18n.t("payment.homeScreen.methodsSection.headerCTA"),
            onPress: handleOnAddMethodPress
          }
        }}
      />
      {isLoading ? (
        <PaymentCardsCarouselSkeleton />
      ) : (
        <PaymentCardsCarousel cards={userMethods} />
      )}
    </>
  );
};

export { PaymentsUserMethodsList };
