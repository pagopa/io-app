import { ContentWrapper, VSpacer } from "@pagopa/io-app-design-system";
import * as AR from "fp-ts/lib/Array";
import * as React from "react";
import { Body } from "../../components/core/typography/Body";
import { H2 } from "../../components/core/typography/H2";
import { withValidatedPagoPaVersion } from "../../components/helpers/withValidatedPagoPaVersion";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import PaymentHistoryList from "../../components/wallet/PaymentsHistoryList";
import I18n from "../../i18n";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import { navigateToPaymentHistoryDetail } from "../../store/actions/navigation";
import {
  PaymentHistory,
  paymentsHistorySelector
} from "../../store/reducers/payments/history";
import { useIOSelector } from "../../store/hooks";

const ListEmptyComponent = () => (
  <ContentWrapper>
    <H2 color={"bluegrey"}>{I18n.t("payment.details.list.empty.title")}</H2>
    <VSpacer size={16} />
    <Body>{I18n.t("payment.details.list.empty.description")}</Body>
    <VSpacer size={24} />
    <EdgeBorderComponent />
  </ContentWrapper>
);

/**
 * A screen displaying the list of all the transactions apprached
 * by the user (completed or cancelled for any reason).
 */
const PaymentsHistoryScreen = () => {
  const historyPayments = useIOSelector(paymentsHistorySelector);
  const navigation = useIONavigation();

  return (
    <BaseScreenComponent
      goBack={() => navigation.goBack()}
      headerTitle={I18n.t("payment.details.list.title")}
    >
      <PaymentHistoryList
        title={I18n.t("wallet.latestTransactions")}
        payments={AR.reverse([...historyPayments])}
        ListEmptyComponent={ListEmptyComponent}
        navigateToPaymentHistoryDetail={(payment: PaymentHistory) =>
          navigateToPaymentHistoryDetail({
            payment
          })
        }
      />
    </BaseScreenComponent>
  );
};

export default withValidatedPagoPaVersion(PaymentsHistoryScreen);
