/**
 * This component will display the payment methods that can be registered
 * on the app
 */
import * as React from "react";
import {
  Divider,
  IOIcons,
  ListItemNav,
  VSpacer
} from "@pagopa/io-app-design-system";
import { FlatList } from "react-native";
import WalletPaymentMethodItemSkeleton from "../../common/components/WalletPaymentMethodItemSkeleton";
import { PaymentMethodResponse } from "../../../../../definitions/pagopa/walletv3/PaymentMethodResponse";

type OwnProps = Readonly<{
  paymentMethods: ReadonlyArray<PaymentMethodResponse>;
  onSelectPaymentMethod: (paymentMethod: PaymentMethodResponse) => void;
  isLoading?: boolean;
}>;

type PaymentMethodItemProps = {
  paymentMethod: PaymentMethodResponse;
  onPress: () => void;
};

const PaymentMethodItem = ({
  paymentMethod,
  onPress
}: PaymentMethodItemProps) => (
  <ListItemNav
    icon={(paymentMethod.asset as IOIcons) || "creditCard"}
    accessibilityLabel={paymentMethod.name}
    onPress={onPress}
    value={paymentMethod.name}
  />
);

const WalletOnboardingPaymentMethodsList = ({
  paymentMethods,
  onSelectPaymentMethod,
  isLoading
}: OwnProps) => (
  <FlatList
    removeClippedSubviews={false}
    data={paymentMethods}
    keyExtractor={item => item.name}
    ListFooterComponent={renderListFooter(isLoading)}
    ItemSeparatorComponent={() => <Divider />}
    renderItem={({ item }) => (
      <PaymentMethodItem
        paymentMethod={item}
        onPress={() => onSelectPaymentMethod(item)}
      />
    )}
  />
);

const renderListFooter = (isLoading?: boolean) => {
  if (isLoading) {
    return (
      <>
        <WalletPaymentMethodItemSkeleton />
        <Divider />
        <WalletPaymentMethodItemSkeleton />
        <Divider />
        <WalletPaymentMethodItemSkeleton />
      </>
    );
  }
  return <VSpacer size={16} />;
};

export default WalletOnboardingPaymentMethodsList;
