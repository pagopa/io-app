import {
  Body,
  ButtonSolid,
  GradientScrollView,
  H4,
  IOStyles,
  ListItemHeader,
  ListItemTransaction,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
import I18n from "../../../../i18n";
import {
  formatDateOrDefault,
  formatNumberCurrencyCentsOrDefault
} from "../../../idpay/common/utils/strings";
import { PaymentHistory } from "../../history/types";

const loadingHistory = Array.from({ length: 5 }).map((_, index) => (
  <ListItemTransaction
    isLoading={true}
    key={index}
    transactionStatus="success"
    transactionAmount=""
    title=""
    subtitle=""
  />
));

const mapHistoryToItems = (history: ReadonlyArray<PaymentHistory>) =>
  history.map((item: PaymentHistory, index) => (
    <ListItemTransaction
      key={index}
      title={item.verifiedData?.paName ?? ""}
      transactionAmount={formatNumberCurrencyCentsOrDefault(
        item.verifiedData?.amount,
        "-"
      )}
      subtitle={formatDateOrDefault(item.startedAt, "-", "DD MMM YYYY, hh:mm")}
      transactionStatus={"success"}
    />
  ));

type PaymentHistorySectionProps = {
  history: ReadonlyArray<PaymentHistory>;
  isLoading?: boolean;
};
const PaymentHistorySection = ({
  history,
  isLoading
}: PaymentHistorySectionProps) => {
  const historyRenderElements = isLoading
    ? loadingHistory
    : mapHistoryToItems(history);

  const shouldRenderEmpty = historyRenderElements.length === 0;

  if (shouldRenderEmpty) {
    return <EmptyPaymentHistorySection />;
  }

  return (
    <>
      <View style={IOStyles.horizontalContentPadding}>
        <ListItemHeader
          label={I18n.t("payment.homeScreen.historySection.header")}
          accessibilityLabel={I18n.t(
            "payment.homeScreen.historySection.header"
          )}
          endElement={{
            type: "buttonLink",
            componentProps: {
              label: I18n.t("payment.homeScreen.historySection.headerCTA"),
              onPress: () => null
            }
          }}
        />
      </View>
      <GradientScrollView
        primaryActionProps={{
          accessibilityLabel: I18n.t("payment.homeScreen.CTA"),
          label: I18n.t("payment.homeScreen.CTA"),
          onPress: () => null,
          icon: "qrCode",
          iconPosition: "end"
        }}
      >
        {historyRenderElements}
      </GradientScrollView>
    </>
  );
};

export const EmptyPaymentHistorySection = () => (
  <View style={[IOStyles.horizontalContentPadding, IOStyles.alignCenter]}>
    <H4 style={{ textAlign: "center" }}>
      {I18n.t("payment.homeScreen.historySection.empty.header")}
    </H4>
    <VSpacer size={8} />
    <Body style={{ textAlign: "center" }}>
      {I18n.t("payment.homeScreen.historySection.empty.body")}
    </Body>
    <VSpacer size={24} />
    <ButtonSolid
      accessibilityLabel={I18n.t("payment.homeScreen.CTA")}
      label={I18n.t("payment.homeScreen.CTA")}
      onPress={() => null}
      icon={"qrCode"}
      iconPosition={"end"}
      fullWidth={true}
    />
  </View>
);

export default PaymentHistorySection;
