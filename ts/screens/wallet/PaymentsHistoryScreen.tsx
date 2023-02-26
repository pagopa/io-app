import * as AR from "fp-ts/lib/Array";
import { Content, Text as NBText } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { VSpacer } from "../../components/core/spacer/Spacer";
import { H2 } from "../../components/core/typography/H2";
import { IOColors } from "../../components/core/variables/IOColors";
import RemindEmailValidationOverlay from "../../components/RemindEmailValidationOverlay";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { EdgeBorderComponent } from "../../components/screens/EdgeBorderComponent";
import PaymentHistoryList from "../../components/wallet/PaymentsHistoryList";
import I18n from "../../i18n";
import {
  PaymentHistory,
  paymentsHistorySelector
} from "../../store/reducers/payments/history";
import variables from "../../theme/variables";
import ROUTES from "../../navigation/routes";
import RemindUpdatePagoPaVersionOverlay from "../../components/RemindUpdatePagoPaVersionOverlay";
import { useIOSelector } from "../../store/hooks";
import { isPagoPaSupportedSelector } from "../../common/versionInfo/store/reducers/versionInfo";
import { isProfileEmailValidatedSelector } from "../../store/reducers/profile";
import { emailValidationSelector } from "../../store/reducers/emailValidation";

const styles = StyleSheet.create({
  noBottomPadding: {
    padding: variables.contentPadding,
    paddingBottom: 0
  },
  whiteBg: {
    backgroundColor: IOColors.white
  }
});

const ListEmptyComponent = (
  <Content
    scrollEnabled={false}
    style={[styles.noBottomPadding, styles.whiteBg]}
  >
    <H2 color={"bluegrey"}>{I18n.t("payment.details.list.empty.title")}</H2>
    <VSpacer size={16} />
    <NBText>{I18n.t("payment.details.list.empty.description")}</NBText>
    <VSpacer size={24} />
    <EdgeBorderComponent />
  </Content>
);

/**
 * A screen displaying the list of all the transactions apprached
 * by the user (completed or cancelled for any reason).
 */
const PaymentsHistoryScreen = () => {
  const historyPayments = useIOSelector(paymentsHistorySelector);
  const isPagoPaVersionSupported = useIOSelector(isPagoPaSupportedSelector);
  const isEmailValidated = useIOSelector(isProfileEmailValidatedSelector);
  const acknowledgeOnEmailValidated = useIOSelector(
    emailValidationSelector
  ).acknowledgeOnEmailValidated;
  const navigation = useNavigation();

  if (!isPagoPaVersionSupported) {
    return (
      <BaseScreenComponent goBack={true}>
        <RemindUpdatePagoPaVersionOverlay />
      </BaseScreenComponent>
    );
  }

  if (
    !isEmailValidated &&
    pipe(
      acknowledgeOnEmailValidated,
      O.getOrElse(() => true)
    )
  ) {
    return <RemindEmailValidationOverlay />;
  }

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
          navigation.navigate(ROUTES.PAYMENT_HISTORY_DETAIL_INFO, {
            payment
          })
        }
      />
    </BaseScreenComponent>
  );
};

export default PaymentsHistoryScreen;
