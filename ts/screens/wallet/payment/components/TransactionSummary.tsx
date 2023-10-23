import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import {
  Badge,
  Divider,
  IOColors,
  IOIcons,
  IconButton,
  ListItemInfo,
  ListItemInfoCopy
} from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { PaymentState } from "../../../../store/reducers/wallet/payment";
import customVariables from "../../../../theme/variables";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { cleanTransactionDescription } from "../../../../utils/payment";
import {
  centsToAmount,
  formatNumberAmount
} from "../../../../utils/stringBuilder";
import { usePaymentAmountInfoBottomSheet } from "../hooks/usePaymentAmountInfoBottomSheet";
import { getRecepientName } from "../../../../utils/strings";
import { format } from "../../../../utils/dates";
import { getAccessibleAmountText } from "../../../../utils/accessibility";

const styles = StyleSheet.create({
  spacer: {
    height: customVariables.spacerExtrasmallHeight
  },
  placeholder: {
    paddingTop: 9
  }
});

const LoadingPlaceholder = (props: { size: "full" | "half" }) => (
  <Placeholder.Box
    width={props.size === "full" ? 180 : 90}
    height={16}
    radius={8}
    animate={"shine"}
    color={IOColors.greyLight}
  />
);

type RowProps = Readonly<{
  title: string;
  value?: string;
  icon?: IOIcons;
  isLoading?: boolean;
  hideSeparator?: boolean;
  placeholder?: React.ReactElement;
  action?: React.ReactNode;
  onPress?: () => void;
}>;

export const TransactionSummaryRow = (
  props: React.PropsWithChildren<RowProps>
): React.ReactElement | null => {
  const { title, value, icon, isLoading, placeholder, action, hideSeparator } =
    props;

  if (!value && !isLoading) {
    return null;
  }

  const accessibilityLabel = value
    ? `${title}, ${getAccessibleAmountText(value)}`
    : title;

  return (
    <React.Fragment>
      <ListItemInfo
        accessibilityLabel={accessibilityLabel}
        icon={icon}
        label={title}
        value={
          !isLoading ? (
            value
          ) : (
            <View style={styles.placeholder}>{placeholder}</View>
          )
        }
        action={action}
      />
      {!hideSeparator && <Divider />}
    </React.Fragment>
  );
};

type Props = Readonly<{
  paymentNoticeNumber: string;
  organizationFiscalCode: string;
  paymentVerification: PaymentState["verifica"];
  isPaid: boolean;
}>;

export const TransactionSummary = (props: Props): React.ReactElement => {
  const isLoading = pot.isLoading(props.paymentVerification);

  const recipient = pipe(
    pot.toOption(props.paymentVerification),
    O.chainNullableK(_ => _.enteBeneficiario),
    O.map(getRecepientName),
    O.toUndefined
  );

  const description = pot.toUndefined(
    pot.mapNullable(props.paymentVerification, _ =>
      cleanTransactionDescription(_.causaleVersamento)
    )
  );

  const amount = pot.toUndefined(
    pot.map(props.paymentVerification, _ =>
      formatNumberAmount(centsToAmount(_.importoSingoloVersamento), true)
    )
  );

  const dueDate = pipe(
    props.paymentVerification,
    pot.toOption,
    O.chainNullableK(_ => _.dueDate),
    O.map(_ => format(_, "DD/MM/YYYY")),
    O.toUndefined
  );

  const formattedPaymentNoticeNumber = props.paymentNoticeNumber
    .replace(/(\d{4})/g, "$1  ")
    .trim();

  const { presentPaymentInfoBottomSheet, paymentInfoBottomSheet } =
    usePaymentAmountInfoBottomSheet();

  const renderAmountAction = () => {
    if (props.isPaid && !isLoading) {
      return <Badge text={I18n.t("messages.badge.paid")} variant="success" />;
    } else if (!props.isPaid && !isLoading) {
      return (
        <IconButton
          icon="info"
          accessibilityLabel="info"
          onPress={presentPaymentInfoBottomSheet}
        />
      );
    }
    return null;
  };

  return (
    <>
      <TransactionSummaryRow
        title={I18n.t("wallet.firstTransactionSummary.recipient")}
        value={recipient}
        icon="institution"
        isLoading={isLoading}
        placeholder={<LoadingPlaceholder size={"full"} />}
      />
      <TransactionSummaryRow
        title={I18n.t("wallet.firstTransactionSummary.object")}
        value={description}
        icon="notes"
        placeholder={
          <>
            <LoadingPlaceholder size={"full"} />
            <View style={styles.spacer} />
            <LoadingPlaceholder size={"full"} />
          </>
        }
        isLoading={isLoading}
      />
      <TransactionSummaryRow
        title={I18n.t("wallet.firstTransactionSummary.amount")}
        value={amount}
        icon="psp"
        placeholder={<LoadingPlaceholder size={"half"} />}
        isLoading={isLoading}
        action={renderAmountAction()}
      />
      <TransactionSummaryRow
        title={I18n.t("wallet.firstTransactionSummary.dueDate")}
        value={dueDate}
        icon="calendar"
        placeholder={<LoadingPlaceholder size={"half"} />}
        isLoading={isLoading}
      />

      <ListItemInfoCopy
        value={formattedPaymentNoticeNumber}
        icon="docPaymentCode"
        label={I18n.t("payment.noticeCode")}
        accessibilityLabel={I18n.t("payment.noticeCode")}
        onPress={() =>
          clipboardSetStringWithFeedback(props.paymentNoticeNumber)
        }
      />
      <Divider />
      <ListItemInfoCopy
        value={props.organizationFiscalCode}
        icon="entityCode"
        label={I18n.t("wallet.firstTransactionSummary.entityCode")}
        accessibilityLabel={I18n.t("wallet.firstTransactionSummary.entityCode")}
        onPress={() =>
          clipboardSetStringWithFeedback(props.organizationFiscalCode)
        }
      />
      {paymentInfoBottomSheet}
    </>
  );
};
