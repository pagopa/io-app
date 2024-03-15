import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { ButtonOutline, Divider } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { Detail_v2Enum } from "../../../../../definitions/backend/PaymentProblemJson";
import { RawAccordion } from "../../../../components/core/accordion/RawAccordion";
import { H4 } from "../../../../components/core/typography/H4";
import I18n from "../../../../i18n";
import customVariables from "../../../../theme/variables";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { isDuplicatedPayment } from "../../../../utils/payment";
import { TransactionSummaryError } from "../TransactionSummaryScreen";
import { TransactionSummaryRow } from "./TransactionSummary";

type Props = Readonly<{
  error: TransactionSummaryError;
  paymentNoticeNumber: string;
  organizationFiscalCode: string;
  messageId: string | undefined;
}>;

export const TransactionSummaryErrorDetails = ({
  error,
  paymentNoticeNumber,
  organizationFiscalCode,
  messageId
}: React.PropsWithChildren<Props>): React.ReactElement | null => {
  const errorOrUndefined = O.toUndefined(error);
  if (
    errorOrUndefined === undefined ||
    isDuplicatedPayment(error) ||
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
          paddingTop: customVariables.spacerLargeHeight,
          paddingBottom: customVariables.spacerSmallHeight
        }}
        accessibilityLabel={I18n.t(
          "wallet.firstTransactionSummary.errorDetails.title"
        )}
      >
        <View>
          <Divider />
          {detailsData.map((row, index, array) =>
            row.value !== undefined ? (
              <>
                <TransactionSummaryRow
                  title={row.key}
                  value={row.value}
                  key={index}
                />
                {index !== array.length - 1 && <Divider />}
              </>
            ) : undefined
          )}
          <View>
            <ButtonOutline
              label={I18n.t(
                "wallet.firstTransactionSummary.errorDetails.copyToClipboard"
              )}
              accessibilityLabel={I18n.t(
                "wallet.firstTransactionSummary.errorDetails.copyToClipboard"
              )}
              onPress={() => clipboardSetStringWithFeedback(clipboardString)}
              fullWidth
            />
          </View>
        </View>
      </RawAccordion>
    </View>
  );
};
