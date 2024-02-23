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
import { useIOSelector } from "../../../../store/hooks";
import { walletOnboardingSelectedPaymentMethodSelector } from "../store";

type OwnProps = Readonly<{
  paymentMethods: ReadonlyArray<PaymentMethodResponse>;
  onSelectPaymentMethod: (paymentMethod: PaymentMethodResponse) => void;
  isLoadingMethods?: boolean;
  isLoadingWebView?: boolean;
  header?: React.ReactElement;
}>;

type PaymentMethodItemProps = {
  paymentMethod: PaymentMethodResponse;
  isLoading?: boolean;
  onPress: () => void;
};

const PaymentMethodItem = ({
  paymentMethod,
  isLoading,
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
          loading={isLoading}
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
  isLoadingMethods,
  isLoadingWebView,
  header
}: OwnProps) => {
  const selectedPaymentMethodId = useIOSelector(
    walletOnboardingSelectedPaymentMethodSelector
  );
  return (
    <FlatList
      removeClippedSubviews={false}
      contentContainerStyle={IOStyles.horizontalContentPadding}
      data={paymentMethods}
      keyExtractor={item => item.id}
      ListHeaderComponent={header}
      ListFooterComponent={renderListFooter(isLoadingMethods)}
      ItemSeparatorComponent={() => <Divider />}
      renderItem={({ item }) => (
        <PaymentMethodItem
          paymentMethod={item}
          isLoading={isLoadingWebView && item.id === selectedPaymentMethodId}
          onPress={() => onSelectPaymentMethod(item)}
        />
      )}
    />
  );
};

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
