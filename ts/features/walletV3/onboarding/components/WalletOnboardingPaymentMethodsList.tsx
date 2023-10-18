/**
 * This component will display the payment methods that can be registered
 * on the app
 */
import * as React from "react";
import {
  Divider,
  IOIcons,
  IOStyles,
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
  header?: React.ReactElement;
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
  isLoading,
  header
}: OwnProps) => (
  <FlatList
    removeClippedSubviews={false}
    contentContainerStyle={IOStyles.horizontalContentPadding}
    data={paymentMethods}
    keyExtractor={item => item.name}
    ListHeaderComponent={header}
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
