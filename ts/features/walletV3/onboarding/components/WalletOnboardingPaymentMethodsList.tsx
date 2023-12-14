/**
 * This component will display the payment methods that can be registered
 * on the app
 */
import * as React from "react";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import {
  Divider,
  IOLogoPaymentType,
  IOPaymentLogos,
  IOStyles,
  ListItemNav,
  VSpacer
} from "@pagopa/io-app-design-system";
import { FlatList } from "react-native";
import { WalletPaymentMethodItemSkeleton } from "../../common/components/WalletPaymentMethodItemSkeleton";
import { PaymentMethodResponse } from "../../../../../definitions/pagopa/walletv3/PaymentMethodResponse";
import { findFirstCaseInsensitive } from "../../../../utils/object";

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
}: PaymentMethodItemProps) => {
  const listItemNavCommonProps: ListItemNav = {
    accessibilityLabel: paymentMethod.description,
    onPress,
    value: paymentMethod.description
  };

  return pipe(
    paymentMethod.asset,
    O.fromNullable,
    O.chain(findFirstCaseInsensitive(IOPaymentLogos)),
    O.map(([brand]) => brand),
    O.fold(
      () => <ListItemNav {...listItemNavCommonProps} icon="creditCard" />,
      brand => (
        <ListItemNav
          {...listItemNavCommonProps}
          paymentLogo={brand as IOLogoPaymentType}
        />
      )
    )
  );
};

/**
 * This component shows a list of available payment methods that can be onboarded
 */
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
