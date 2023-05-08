import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import AmountIcon from "../../../../../img/features/payments/Amount.svg";
import CalendarIcon from "../../../../../img/features/payments/calendar.svg";
import NoticeIcon from "../../../../../img/features/payments/Giacenza.svg";
import { IOBadge } from "../../../../components/core/IOBadge";
import { Body } from "../../../../components/core/typography/Body";
import { H4 } from "../../../../components/core/typography/H4";
import { IOColors } from "../../../../components/core/variables/IOColors";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import IconFont from "../../../../components/ui/IconFont";
import { MultiImage } from "../../../../components/ui/MultiImage";
import I18n from "../../../../i18n";
import { PaymentState } from "../../../../store/reducers/wallet/payment";
import customVariables from "../../../../theme/variables";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { getLogoForOrganization } from "../../../../utils/organizations";
import { cleanTransactionDescription } from "../../../../utils/payment";
import {
  centsToAmount,
  formatNumberAmount
} from "../../../../utils/stringBuilder";
import { usePaymentAmountInfoBottomSheet } from "../hooks/usePaymentAmountInfoBottomSheet";
import { getRecepientName } from "../../../../utils/strings";

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  vertical: {
    flex: 1,
    flexDirection: "column",
    paddingVertical: customVariables.spacerHeight
  },
  horizontal: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: customVariables.spacerLargeHeight
  },
  icon: {
    width: customVariables.iconSizeBase,
    marginEnd: customVariables.spacerWidth
  },
  organizationIcon: {
    width: customVariables.iconSizeBase,
    height: customVariables.iconSizeBase
  },
  title: {
    flex: 1
  },
  children: {
    paddingLeft: customVariables.spacingBase
  },
  separator: {
    backgroundColor: customVariables.itemSeparator,
    height: StyleSheet.hairlineWidth
  },
  spacer: {
    height: customVariables.spacerExtrasmallHeight
  },
  placeholder: {
    paddingTop: 9
  }
});

const iconProps = { color: IOColors.bluegrey };

const LoadingPlaceholder = (props: { size: "full" | "half" }) => (
  <Placeholder.Box
    width={props.size === "full" ? 180 : 90}
    height={16}
    radius={8}
    animate={"shine"}
    color={IOColors.greyLight}
  />
);

const InfoButton = (props: { onPress: () => void }) => (
  <TouchableDefaultOpacity
    onPress={props.onPress}
    style={{ padding: 10 }}
    accessible={true}
    accessibilityLabel={I18n.t(
      "wallet.firstTransactionSummary.amountInfo.title"
    )}
    accessibilityRole={"button"}
  >
    <IconFont name={"io-info"} size={24} color={IOColors.blue} />
  </TouchableDefaultOpacity>
);

type RowProps = Readonly<{
  axis: "horizontal" | "vertical";
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  placeholder?: React.ReactNode;
  isLoading?: boolean;
  hideSeparator?: boolean;
  onPress?: () => void;
}>;

export const TransactionSummaryRow = (
  props: React.PropsWithChildren<RowProps>
): React.ReactElement | null => {
  if (!props.isLoading && !props.subtitle) {
    return null;
  }

  return (
    <TouchableDefaultOpacity onPress={props.onPress} accessible={false}>
      <View>
        <View style={styles.row}>
          {props.icon && <View style={styles.icon}>{props.icon}</View>}
          <View
            style={
              props.axis === "vertical" ? styles.vertical : styles.horizontal
            }
            accessible={true}
            accessibilityLabel={`${props.title}: ${
              props.isLoading
                ? I18n.t("global.accessibility.activityIndicator.label")
                : props.subtitle
            }`}
          >
            <Body weight="Regular" color={"bluegrey"} style={styles.title}>
              {props.title}
            </Body>
            {!props.isLoading && props.axis === "horizontal" && props.subtitle && (
              <H4 color={"blue"} weight={"SemiBold"}>
                {props.subtitle}
              </H4>
            )}
            {!props.isLoading && props.axis === "vertical" && props.subtitle && (
              <H4 color={"bluegreyDark"} weight={"SemiBold"}>
                {props.subtitle}
              </H4>
            )}
            {props.isLoading && (
              <View style={styles.placeholder}>{props.placeholder}</View>
            )}
          </View>
          {props.children && (
            <View style={styles.children}>{props.children}</View>
          )}
        </View>
        {props.hideSeparator !== true && <View style={styles.separator} />}
      </View>
    </TouchableDefaultOpacity>
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

  const organizationIcon = [
    ...getLogoForOrganization(props.organizationFiscalCode),
    require("../../../../../img/features/payments/Institution.png")
  ];

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

  const formattedPaymentNoticeNumber = props.paymentNoticeNumber
    .replace(/(\d{4})/g, "$1  ")
    .trim();

  const { presentPaymentInfoBottomSheet, paymentInfoBottomSheet } =
    usePaymentAmountInfoBottomSheet();

  return (
    <>
      <TransactionSummaryRow
        axis={"vertical"}
        title={I18n.t("wallet.firstTransactionSummary.recipient")}
        subtitle={recipient}
        icon={
          <MultiImage
            style={styles.organizationIcon}
            source={organizationIcon}
          />
        }
        placeholder={<LoadingPlaceholder size={"full"} />}
        isLoading={isLoading}
      />
      <TransactionSummaryRow
        axis={"vertical"}
        title={I18n.t("wallet.firstTransactionSummary.object")}
        subtitle={description}
        icon={<NoticeIcon {...iconProps} />}
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
        axis={"vertical"}
        title={I18n.t("wallet.firstTransactionSummary.amount")}
        subtitle={amount}
        icon={<AmountIcon {...iconProps}></AmountIcon>}
        placeholder={<LoadingPlaceholder size={"half"} />}
        isLoading={isLoading}
      >
        {props.isPaid && !isLoading && (
          <IOBadge
            small
            text={I18n.t("messages.badge.paid")}
            variant="solid"
            color="aqua"
          />
        )}
        {!props.isPaid && !isLoading && (
          <InfoButton onPress={presentPaymentInfoBottomSheet} />
        )}
      </TransactionSummaryRow>
      {/*
      This undefined will be removed once the backend will return
      the data needed to render the row. We're keeping it "deactivated"
      in order to have a reference for both the string and the icon
      of the final design that we're going to use.
      */}
      {undefined && (
        <TransactionSummaryRow
          axis={"vertical"}
          title={I18n.t("wallet.firstTransactionSummary.expireDate")}
          icon={<CalendarIcon {...iconProps} />}
          placeholder={<LoadingPlaceholder size={"half"} />}
          isLoading={isLoading}
        />
      )}
      <TransactionSummaryRow
        axis={"horizontal"}
        title={I18n.t("payment.noticeCode")}
        subtitle={formattedPaymentNoticeNumber}
        onPress={() =>
          clipboardSetStringWithFeedback(props.paymentNoticeNumber)
        }
      />
      <TransactionSummaryRow
        axis={"horizontal"}
        title={I18n.t("wallet.firstTransactionSummary.entityCode")}
        subtitle={props.organizationFiscalCode}
        onPress={() =>
          clipboardSetStringWithFeedback(props.organizationFiscalCode)
        }
      />
      {paymentInfoBottomSheet}
    </>
  );
};
