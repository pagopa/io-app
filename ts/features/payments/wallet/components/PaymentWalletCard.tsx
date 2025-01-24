import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { withWalletCardBaseComponent } from "../../../wallet/components/WalletCardBaseComponent";
import {
  PaymentCard,
  PaymentCardProps
} from "../../common/components/PaymentCard";
import { WalletCardPressableBase } from "../../../wallet/components/WalletCardPressableBase";
import { PaymentsMethodDetailsRoutes } from "../../details/navigation/routes";

export type PaymentWalletCardProps = PaymentCardProps & {
  walletId: string;
};

const WrappedPaymentCard = (props: PaymentWalletCardProps) => {
  const navigation = useIONavigation();

  const { walletId, ...cardProps } = props;

  const handleOnPress = () => {
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
