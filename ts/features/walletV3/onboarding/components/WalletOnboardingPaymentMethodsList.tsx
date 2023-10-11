/**
 * This component will display the payment methods that can be registered
 * on the app
 */
import * as React from "react";
import { Divider, ListItemNav, VSpacer } from "@pagopa/io-app-design-system";
import { FlatList } from "react-native";

type OwnProps = Readonly<{
  paymentMethods: ReadonlyArray<any>;
  onSelectPaymentMethod: (paymentMethod: any) => void;
}>;

type PaymentMethodItemProps = Readonly<{
  paymentMethod: any;
  onPress: () => void;
}>;

const PaymentMethodItem = ({
  paymentMethod,
  onPress
}: PaymentMethodItemProps) => (
  <ListItemNav
    icon="creditCard"
    accessibilityLabel="test"
    onPress={onPress}
    value="test"
  />
);

const WalletOnboardingPaymentMethodsList = ({
  paymentMethods,
  onSelectPaymentMethod
}: OwnProps) => (
  <FlatList
    removeClippedSubviews={false}
    data={paymentMethods}
    keyExtractor={item => item.name}
    ListFooterComponent={<VSpacer size={16} />}
    ItemSeparatorComponent={() => <Divider />}
    renderItem={({ item }) => (
      <PaymentMethodItem
        paymentMethod={item}
        onPress={() => onSelectPaymentMethod(item)}
      />
    )}
  />
);

export default WalletOnboardingPaymentMethodsList;
