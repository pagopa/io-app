/**
 * This component will display the payment methods that can be registered
 * on the app
 */
import {
  Divider,
  IOVisualCostants,
  ListItemNav,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { FlatList } from "react-native";
import { PaymentMethodResponse } from "../../../../../definitions/pagopa/walletv3/PaymentMethodResponse";
import { useIOSelector } from "../../../../store/hooks";
import { selectPaymentOnboardingSelectedMethod } from "../store/selectors";
import { WalletPaymentMethodItemSkeleton } from "./WalletPaymentMethodItemSkeleton";

type OwnProps = Readonly<{
  paymentMethods: ReadonlyArray<PaymentMethodResponse>;
  onSelectPaymentMethod: (paymentMethod: PaymentMethodResponse) => void;
  isLoadingMethods?: boolean;
  isLoadingWebView?: boolean;
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
    loading: isLoading,
    value: paymentMethod.description
  };

  return pipe(
    paymentMethod.asset,
    O.fromNullable,
    O.fold(
      () => <ListItemNav {...listItemNavCommonProps} icon="creditCard" />,
      brand => (
        <ListItemNav {...listItemNavCommonProps} paymentLogoUri={brand} />
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
  isLoadingWebView
}: OwnProps) => {
  const selectedPaymentMethodId = useIOSelector(
    selectPaymentOnboardingSelectedMethod
  );
  const isMethodLoading = (itemId: string) =>
    isLoadingWebView && itemId === selectedPaymentMethodId;
  const ListFooter = () => renderListFooter(isLoadingMethods);

  return (
    <FlatList
      scrollEnabled={false}
      removeClippedSubviews={false}
      contentContainerStyle={{
        paddingHorizontal: IOVisualCostants.appMarginDefault
      }}
      data={paymentMethods}
      keyExtractor={item => item.id}
      ListFooterComponent={<ListFooter />}
      ItemSeparatorComponent={() => <Divider />}
      renderItem={({ item }) => (
        <PaymentMethodItem
          paymentMethod={item}
          isLoading={isMethodLoading(item.id)}
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
