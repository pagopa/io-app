import * as React from "react";
import { StyleSheet, View } from "react-native";
import { RawAccordion } from "../../../../components/core/accordion/RawAccordion";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { H4 } from "../../../../components/core/typography/H4";
import customVariables from "../../../../theme/variables";
import BlockButtons from "../../../../components/ui/BlockButtons";
import I18n from "../../../../i18n";
import { TransactionSummaryError } from "../NewTransactionSummaryScreen";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { Detail_v2Enum } from "../../../../../definitions/backend/PaymentProblemJson";
import { TransactionSummaryRow } from "./TransactionSummary";

type Props = Readonly<{
  error: TransactionSummaryError;
  paymentNoticeNumber: string;
  organizationFiscalCode: string;
  messageId: string | undefined;
}>;

const Separator = () => (
  <View
    style={{
      backgroundColor: customVariables.itemSeparator,
      height: StyleSheet.hairlineWidth,
      marginHorizontal: customVariables.contentPadding
    }}
  />
);

export const TransactionSummaryErrorDetails = ({
  error,
  paymentNoticeNumber,
  organizationFiscalCode,
  messageId
}: React.PropsWithChildren<Props>): React.ReactElement | null => {
  const errorOrUndefined = error.toUndefined();
  if (
    errorOrUndefined === undefined ||
    errorOrUndefined === "PAA_PAGAMENTO_DUPLICATO" ||
    !Object.keys(Detail_v2Enum).includes(errorOrUndefined)
  ) {
    return null;
  }

  const messageData: ReadonlyArray<{ key: string; value?: string }> = [
    {
      key: I18n.t("payment.noticeCode"),
      value: paymentNoticeNumber
    },
    {
      key: I18n.t("wallet.firstTransactionSummary.entityCode"),
      value: organizationFiscalCode
    }
  ];
  const detailsData: ReadonlyArray<{ key: string; value?: string }> = [
    {
      key: I18n.t("wallet.firstTransactionSummary.errorDetails.errorCode"),
      value: errorOrUndefined
    },
    {
      key: I18n.t("wallet.firstTransactionSummary.errorDetails.messageId"),
      value: messageId
    }
  ];

  const clipboardString = [...messageData, ...detailsData]
    .reduce(
      (acc: ReadonlyArray<string>, curr: { key: string; value?: string }) => {
        if (curr.value) {
          return [...acc, `${curr.key}: ${curr.value}`];
        }
        return acc;
      },
      []
    )
    .join(", ");
  return (
    <View>
      <RawAccordion
        header={
          <H4>{I18n.t("wallet.firstTransactionSummary.errorDetails.title")}</H4>
        }
        headerStyle={{
          ...IOStyles.horizontalContentPadding,
          paddingTop: customVariables.spacerLargeHeight,
          paddingBottom: customVariables.spacerSmallHeight
        }}
        accessibilityLabel={I18n.t(
          "wallet.firstTransactionSummary.errorDetails.title"
        )}
      >
        <View>
          <Separator />
          {detailsData.map((row, index, array) =>
            row.value !== undefined ? (
              <TransactionSummaryRow
                axis={"vertical"}
                title={row.key}
                subtitle={row.value}
                hideSeparator={index === array.length - 1}
                key={index}
              />
            ) : undefined
          )}
          <View style={{ paddingHorizontal: customVariables.contentPadding }}>
            <BlockButtons
              type={"SingleButton"}
              leftButton={{
                primary: true,
                bordered: true,
                title: I18n.t(
                  "wallet.firstTransactionSummary.errorDetails.copyToClipboard"
                ),
                onPress: () => clipboardSetStringWithFeedback(clipboardString)
              }}
            />
          </View>
        </View>
      </RawAccordion>
    </View>
  );
};
