import { IOStyles, ListItemAction } from "@pagopa/io-app-design-system";
import React from "react";
import { Alert, View } from "react-native";
import { useDispatch } from "react-redux";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { hidePaymentsBizEventsReceiptAction } from "../store/actions";

type Props = {
  transactionId: string;
};

const PaymentsBizEventsHideReceiptButton = (props: Props) => {
  const { transactionId } = props;
  const dispatch = useDispatch();
  const navigation = useIONavigation();

  const hideReceipt = () => {
    navigation.goBack();

    dispatch(
      hidePaymentsBizEventsReceiptAction.request({
        transactionId
      })
    );
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
export default PaymentsBizEventsHideReceiptButton;
