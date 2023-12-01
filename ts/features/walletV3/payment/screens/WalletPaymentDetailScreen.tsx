import {
  Divider,
  GradientScrollView,
  IOColors,
  ListItemInfo,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute
} from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import { RptId } from "../../../../../definitions/pagopa/ecommerce/RptId";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { getAccessibleAmountText } from "../../../../utils/accessibility";
import { format } from "../../../../utils/dates";
import { cleanTransactionDescription } from "../../../../utils/payment";
import {
  centsToAmount,
  formatNumberAmount
} from "../../../../utils/stringBuilder";
import { WalletPaymentParamsList } from "../navigation/params";
import { WalletPaymentRoutes } from "../navigation/routes";
import { walletPaymentGetDetails } from "../store/actions/networking";
import { walletPaymentDetailsSelector } from "../store/selectors";

type WalletPaymentDetailScreenNavigationParams = {
  rptId: RptId;
};

type WalletPaymentDetailRouteProps = RouteProp<
  WalletPaymentParamsList,
  "WALLET_PAYMENT_DETAIL"
>;

const WalletPaymentDetailScreen = () => {
  const { params } = useRoute<WalletPaymentDetailRouteProps>();
  const { rptId } = params;
  const dispatch = useIODispatch();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  useHeaderSecondLevel({ title: "" });

  useFocusEffect(
    React.useCallback(() => {
      dispatch(walletPaymentGetDetails.request(rptId));
    }, [dispatch, rptId])
  );

  const navigateToMethodSelection = () => {
    navigation.navigate(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
      screen: WalletPaymentRoutes.WALLET_PAYMENT_PICK_METHOD
    });
  };

  const paymentDetailsPot = useIOSelector(walletPaymentDetailsSelector);
  const isLoading = pot.isLoading(paymentDetailsPot);

  const recipient = pipe(
    paymentDetailsPot,
    pot.toOption,
    O.chainNullableK(_ => _.paName),
    O.toUndefined
  );

  const description = pipe(
    paymentDetailsPot,
    pot.toOption,
    O.map(_ => _.description),
    O.map(cleanTransactionDescription),
    O.toUndefined
  );

  const amount = pipe(
    paymentDetailsPot,
    pot.toOption,
    O.map(_ => _.amount),
    O.map(centsToAmount),
    O.map(amount => formatNumberAmount(amount, true)),
    O.toUndefined
  );

  const dueDate = pipe(
    paymentDetailsPot,
    pot.toOption,
    O.chainNullableK(_ => _.dueDate),
    O.map(_ => format(_, "DD/MM/YYYY")),
    O.toUndefined
  );

  return (
    <GradientScrollView
      primaryActionProps={{
        label: "Vai al pagamento",
        accessibilityLabel: "Vai al pagmento",
        onPress: navigateToMethodSelection,
        disabled: isLoading,
        loading: isLoading
      }}
    >
      <PaymentDetailRow
        icon={"institution"}
        label={I18n.t("wallet.firstTransactionSummary.recipient")}
        accessibilityLabel={I18n.t("wallet.firstTransactionSummary.recipient")}
        value={recipient}
        isLoading={isLoading}
        placeholder={<LoadingPlaceholder size={180} />}
      />
      <Divider />
      <PaymentDetailRow
        icon={"notes"}
        label={I18n.t("wallet.firstTransactionSummary.object")}
        accessibilityLabel={I18n.t("wallet.firstTransactionSummary.object")}
        value={description}
        isLoading={isLoading}
        placeholder={
          <>
            <LoadingPlaceholder size={180} />
            <VSpacer size={8} />
            <LoadingPlaceholder size={180} />
          </>
        }
      />
      <Divider />
      <PaymentDetailRow
        icon={"psp"}
        label={I18n.t("wallet.firstTransactionSummary.amount")}
        accessibilityLabel={I18n.t("wallet.firstTransactionSummary.amount")}
        value={amount}
        isLoading={isLoading}
        placeholder={<LoadingPlaceholder size={90} />}
      />
      <Divider />
      <PaymentDetailRow
        icon="calendar"
        label={I18n.t("wallet.firstTransactionSummary.dueDate")}
        accessibilityLabel={I18n.t("wallet.firstTransactionSummary.dueDate")}
        value={dueDate}
        isLoading={isLoading}
        placeholder={<LoadingPlaceholder size={90} />}
      />
      <Divider />
      {/* 
      <ListItemInfoCopy
        icon="docPaymentCode"
        label={I18n.t("payment.noticeCode")}
        accessibilityLabel={I18n.t("payment.noticeCode")}
        value={formattedPaymentNoticeNumber}
        onPress={() =>
          clipboardSetStringWithFeedback(formattedPaymentNoticeNumber)
        }
      />
      <Divider /> 
      <ListItemInfoCopy
        icon="entityCode"
        label={I18n.t("wallet.firstTransactionSummary.entityCode")}
        accessibilityLabel={I18n.t("wallet.firstTransactionSummary.entityCode")}
        value={organizationFiscalCode}
        onPress={() => clipboardSetStringWithFeedback(organizationFiscalCode)}
      />
      */}
    </GradientScrollView>
  );
};

type PaymentDetailRowProps = ListItemInfo & {
  isLoading?: boolean;
  value?: string;
  placeholder?: React.ReactElement;
};

export const PaymentDetailRow = (props: PaymentDetailRowProps) => {
  if (!props.value && !props.isLoading) {
    return null;
  }

  const accessibilityLabel = props.value
    ? `${props.label}, ${getAccessibleAmountText(props.value)}`
    : props.accessibilityLabel;

  return (
    <ListItemInfo
      {...props}
      accessibilityLabel={accessibilityLabel}
      value={
        !props.isLoading ? (
          props.value
        ) : (
          <View style={styles.placeholder}>{props.placeholder}</View>
        )
      }
    />
  );
};

const LoadingPlaceholder = (props: { size: 90 | 180 }) => (
  <Placeholder.Box
    width={props.size}
    height={16}
    radius={8}
    animate={"fade"}
    color={IOColors.greyLight}
  />
);

const styles = StyleSheet.create({
  placeholder: {
    paddingTop: 9
  }
});

export { WalletPaymentDetailScreen };
export type { WalletPaymentDetailScreenNavigationParams };
