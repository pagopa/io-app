import {
  IOStyles,
  IOToast,
  ListItemAction
} from "@pagopa/io-app-design-system";
import React from "react";
import { Alert, View } from "react-native";
import { useDispatch } from "react-redux";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import {
  getPaymentsLatestBizEventsTransactionsAction,
  hidePaymentsBizEventsReceiptAction
} from "../store/actions";
import { PaymentsTransactionBizEventsRoutes } from "../navigation/routes";

type Props = {
  transactionId: string;
};

const PaymentsBizEventsHideReceiptButton = (props: Props) => {
  const { transactionId } = props;
  const dispatch = useDispatch();
  const navigation = useIONavigation();

  const onSuccess = () => {
    dispatch(getPaymentsLatestBizEventsTransactionsAction.request());

    navigation.navigate(ROUTES.MAIN, {
      screen: ROUTES.PAYMENTS_HOME
    });

    IOToast.success(
      I18n.t("features.payments.transactions.receipt.delete.successful")
    );
  };

  const onError = () => {
    navigation.goBack();
    IOToast.error(
      I18n.t("features.payments.transactions.receipt.delete.failed")
    );
  };

  const hideReceipt = () =>
    dispatch(
      hidePaymentsBizEventsReceiptAction.request({
        transactionId,
        onSuccess,
        onError
      })
    );

  const navigateToAction = () => {
    navigation.navigate(
      PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_NAVIGATOR,
      {
        screen:
          PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_LOADING_SCREEN
      }
    );
    hideReceipt();
  };

  const handleHideFromList = () => {
    Alert.alert(
      I18n.t("features.payments.transactions.receipt.hideBanner.title"),
      I18n.t("features.payments.transactions.receipt.hideBanner.content"),
      [
        {
          text: I18n.t(
            "features.payments.transactions.receipt.hideBanner.accept"
          ),
          style: "destructive",
          onPress: navigateToAction
        },
        {
          text: I18n.t("global.buttons.cancel"),
          style: "default"
        }
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={IOStyles.horizontalContentPadding}>
      <ListItemAction
        label={I18n.t("features.payments.transactions.receipt.hideFromList")}
        onPress={handleHideFromList}
        accessibilityLabel={I18n.t(
          "features.payments.transactions.receipt.hideFromList"
        )}
        icon="eyeHide"
        variant="primary"
      />
    </View>
  );
};
export default PaymentsBizEventsHideReceiptButton;
