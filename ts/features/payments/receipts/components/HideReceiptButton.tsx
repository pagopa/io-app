import { IOStyles, ListItemAction } from "@pagopa/io-app-design-system";
import React from "react";
import { Alert, View } from "react-native";
import { useDispatch } from "react-redux";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import * as analytics from "../analytics";
import { hidePaymentsReceiptAction } from "../store/actions";
import { useIOSelector } from "../../../../store/hooks";
import { paymentAnalyticsDataSelector } from "../../history/store/selectors";

type Props = {
  transactionId: string;
};

const HideReceiptButton = (props: Props) => {
  const { transactionId } = props;
  const dispatch = useDispatch();
  const navigation = useIONavigation();
  const paymentAnalyticsData = useIOSelector(paymentAnalyticsDataSelector);

  const analyticsHideReceiptAction = () => {
    analytics.trackHideReceipt({
      organization_name: paymentAnalyticsData?.receiptOrganizationName,
      first_time_opening: paymentAnalyticsData?.receiptFirstTimeOpening,
      user: paymentAnalyticsData?.receiptUser
    });
  };

  const analyticsHideReceiptConfirmAction = () => {
    analytics.trackHideReceiptConfirm({
      organization_name: paymentAnalyticsData?.receiptOrganizationName,
      first_time_opening: paymentAnalyticsData?.receiptFirstTimeOpening,
      user: paymentAnalyticsData?.receiptUser
    });
  };

  const hideReceipt = () => {
    navigation.goBack();

    analyticsHideReceiptConfirmAction();

    dispatch(
      hidePaymentsReceiptAction.request({
        transactionId
      })
    );
  };

  const handleHideFromList = () => {
    analyticsHideReceiptAction();

    Alert.alert(
      I18n.t("features.payments.transactions.receipt.hideBanner.title"),
      I18n.t("features.payments.transactions.receipt.hideBanner.content"),
      [
        {
          text: I18n.t(
            "features.payments.transactions.receipt.hideBanner.accept"
          ),
          style: "destructive",
          onPress: hideReceipt
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
export default HideReceiptButton;
