import React from "react";
import { View, StyleSheet, Text } from "react-native";
import * as pot from "italia-ts-commons/lib/pot";
import { Badge } from "native-base";
import customVariables from "../../../../theme/variables";
import { H5 } from "../../../../components/core/typography/H5";
import { H4 } from "../../../../components/core/typography/H4";
import I18n from "../../../../i18n";
import IconFont from "../../../../components/ui/IconFont";
import { IOColors } from "../../../../components/core/variables/IOColors";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";

import AmountIcon from "../../../../../img/features/payments/Amount.svg";
import CalendarIcon from "../../../../../img/features/payments/calendar.svg";
import OrganizationIcon from "../../../../../img/features/payments/organization.svg";
import NoticeIcon from "../../../../../img/features/payments/Giacenza.svg";
import { PaymentState } from "../../../../store/reducers/wallet/payment";
import { formatTextRecipient } from "../../../../utils/strings";
import {
  centsToAmount,
  formatNumberAmount
} from "../../../../utils/stringBuilder";
import { cleanTransactionDescription } from "../../../../utils/payment";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
import { BaseTypography } from "../../../../components/core/typography/BaseTypography";

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
  }
});

const iconProps = { color: IOColors.bluegrey };

type RowProps = Readonly<{
  axis: "horizontal" | "vertical";
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}>;

const TransactionSummaryRow = (
  props: React.PropsWithChildren<RowProps>
): React.ReactElement => (
  <View style={styles.container}>
    <View style={styles.row}>
      {props.icon && <View style={styles.icon}>{props.icon}</View>}
      <View
        style={props.axis === "vertical" ? styles.vertical : styles.horizontal}
      >
        <H5 weight="Regular" color={"bluegrey"} style={styles.title}>
          {props.title}
        </H5>
        {props.axis === "horizontal" && props.subtitle && (
          <H5 color={"bluegreyDark"} weight={"Regular"}>
            {props.subtitle}
          </H5>
        )}
        {props.axis === "vertical" && props.subtitle && (
          <H4 color={"bluegreyDark"} weight={"SemiBold"}>
            {props.subtitle}
          </H4>
        )}
      </View>
      {props.children && <View style={styles.children}>{props.children}</View>}
    </View>
    <View style={styles.separator} />
  </View>
);

type Props = Readonly<{
  paymentNoticeNumber: string;
  organizationFiscalCode: string;
  paymentVerification: PaymentState["verifica"];
  isPaid: boolean;
}>;

export const TransactionSummary = (props: Props): React.ReactElement => {
  const recipient = pot
    .toOption(props.paymentVerification)
    .mapNullable(_ => _.enteBeneficiario)
    .map(formatTextRecipient)
    .toUndefined();

  const description = pot.getOrElse<string>(
    pot.mapNullable(props.paymentVerification, _ =>
      cleanTransactionDescription(_.causaleVersamento)
    ),
    "-"
  );

  const amount: string = pot.getOrElse(
    pot.map(props.paymentVerification, _ =>
      formatNumberAmount(centsToAmount(_.importoSingoloVersamento), true)
    ),
    "-"
  );

  const copyButton = (value: string) => (
    <TouchableDefaultOpacity
      accessible={true}
      accessibilityRole={"button"}
      accessibilityHint={I18n.t("bonus.cgn.accessibility.code")}
      onPress={() => clipboardSetStringWithFeedback(value)}
    >
      <View style={{ justifyContent: "center" }}>
        <IconFont name="io-copy" color={IOColors.blue} />
      </View>
    </TouchableDefaultOpacity>
  );

  return (
    <>
      {recipient && (
        <TransactionSummaryRow
          axis={"vertical"}
          title={I18n.t("wallet.firstTransactionSummary.recipient")}
          subtitle={recipient}
          icon={<OrganizationIcon {...iconProps}></OrganizationIcon>}
        />
      )}
      <TransactionSummaryRow
        axis={"vertical"}
        title={I18n.t("wallet.firstTransactionSummary.object")}
        subtitle={description}
        icon={<NoticeIcon {...iconProps}></NoticeIcon>}
      />
      <TransactionSummaryRow
        axis={"vertical"}
        title={I18n.t("wallet.firstTransactionSummary.amount")}
        subtitle={amount}
        icon={<AmountIcon {...iconProps}></AmountIcon>}
      >
        {props.isPaid && (
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
      </TransactionSummaryRow>
      <TransactionSummaryRow
        axis={"vertical"}
        title={I18n.t("wallet.firstTransactionSummary.expireDate")}
        subtitle={props.paymentNoticeNumber}
        icon={<CalendarIcon {...iconProps}></CalendarIcon>}
      />
      <TransactionSummaryRow
        axis={"horizontal"}
        title={I18n.t("payment.noticeCode")}
        subtitle={props.paymentNoticeNumber}
      >
        {copyButton(props.paymentNoticeNumber)}
      </TransactionSummaryRow>
      <TransactionSummaryRow
        axis={"horizontal"}
        title={I18n.t("wallet.firstTransactionSummary.entityCode")}
        subtitle={props.organizationFiscalCode}
      >
        {copyButton(props.organizationFiscalCode)}
      </TransactionSummaryRow>
    </>
  );
};
