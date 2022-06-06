import React from "react";
import { View, StyleSheet } from "react-native";
import * as pot from "italia-ts-commons/lib/pot";
import { Badge } from "native-base";
import Placeholder from "rn-placeholder";
import customVariables from "../../../../theme/variables";
import { H5 } from "../../../../components/core/typography/H5";
import { H4 } from "../../../../components/core/typography/H4";
import I18n from "../../../../i18n";
import { IOColors } from "../../../../components/core/variables/IOColors";

import AmountIcon from "../../../../../img/features/payments/Amount.svg";
import CalendarIcon from "../../../../../img/features/payments/calendar.svg";
import NoticeIcon from "../../../../../img/features/payments/Giacenza.svg";
import { PaymentState } from "../../../../store/reducers/wallet/payment";
import { formatTextRecipient } from "../../../../utils/strings";
import {
  centsToAmount,
  formatNumberAmount
} from "../../../../utils/stringBuilder";
import { cleanTransactionDescription } from "../../../../utils/payment";
import { BaseTypography } from "../../../../components/core/typography/BaseTypography";
import IconFont from "../../../../components/ui/IconFont";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import { usePaymentAmountInfoBottomSheet } from "../hooks/usePaymentAmountInfoBottomSheet";
import { getLogoForOrganization } from "../../../../utils/organizations";
import { MultiImage } from "../../../../components/ui/MultiImage";

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: customVariables.contentPadding
  },
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
  badgeInfo: {
    height: 18,
    alignItems: "center",
    backgroundColor: IOColors.aqua,
    paddingHorizontal: 8
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
}>;

export const TransactionSummaryRow = (
  props: React.PropsWithChildren<RowProps>
): React.ReactElement | null => {
  if (!props.isLoading && !props.subtitle) {
    return null;
  }

  return (
    <View style={styles.container}>
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
          <H5 weight="Regular" color={"bluegrey"} style={styles.title}>
            {props.title}
          </H5>
          {!props.isLoading && props.axis === "horizontal" && props.subtitle && (
            <H5 color={"bluegreyDark"} weight={"Regular"}>
              {props.subtitle}
            </H5>
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

  const recipient = pot
    .toOption(props.paymentVerification)
    .mapNullable(_ => _.enteBeneficiario)
    .map(formatTextRecipient)
    .toUndefined();

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
          <Badge style={styles.badgeInfo}>
            <BaseTypography
              fontStyle={{ fontSize: 12 }}
              weight={"SemiBold"}
              color={"bluegreyDark"}
            >
              {I18n.t("messages.badge.paid")}
            </BaseTypography>
          </Badge>
        )}
        {!props.isPaid && !isLoading && (
          <InfoButton onPress={presentPaymentInfoBottomSheet} />
        )}
      </TransactionSummaryRow>
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
        subtitle={props.paymentNoticeNumber}
      />
      <TransactionSummaryRow
        axis={"horizontal"}
        title={I18n.t("wallet.firstTransactionSummary.entityCode")}
        subtitle={props.organizationFiscalCode}
      />
      {paymentInfoBottomSheet}
    </>
  );
};
