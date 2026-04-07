import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { withWalletCardBaseComponent } from "../../../wallet/components/WalletCardBaseComponent";
import { WalletCardPressableBase } from "../../../wallet/components/WalletCardPressableBase";
import {
  PaymentCard,
  PaymentCardProps
} from "../../common/components/PaymentCard";
import { PaymentsMethodDetailsRoutes } from "../../details/navigation/routes";
import * as analytics from "../../home/analytics";
import { paymentsWalletUserMethodsSelector } from "../../wallet/store/selectors";

export type PaymentWalletCardProps = PaymentCardProps & {
  walletId: string;
};

const WrappedPaymentCard = (props: PaymentWalletCardProps) => {
  const navigation = useIONavigation();

  const { walletId, ...cardProps } = props;

  const paymentMethods = useIOSelector(paymentsWalletUserMethodsSelector);

  const getPaymentMethodSelected = (methodId: string): string | undefined =>
    pipe(
      paymentMethods,
      pot.toOption,
      O.chainNullableK(methods =>
        methods.find(method => method.walletId === methodId)
      ),
      O.map(method => method.details?.type),
      O.toUndefined
    );

  const handleOnPress = () => {
    analytics.trackPaymentWalletMethodDetail({
      payment_method_selected: getPaymentMethodSelected(walletId),
      payment_method_status: cardProps.isExpired ? "invalid" : "valid",
      source: "wallet"
    });

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

  return (
    <WalletCardPressableBase onPress={handleOnPress}>
      <PaymentCard {...cardProps} />
    </WalletCardPressableBase>
  );
};

/**
 * Wrapper component which adds wallet capabilites to the PaymentCard component
 */
export const PaymentWalletCard =
  withWalletCardBaseComponent(WrappedPaymentCard);
