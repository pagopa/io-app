import { ContentWrapper, ListItemAction } from "@io-app/design-system";
import I18n from "i18next";
import { Alert } from "react-native";
import { useDispatch } from "react-redux";

import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { paymentAnalyticsDataSelector } from "../../history/store/selectors";
import { HideReceiptTrigger } from "../analytics";
import {
  analyticsHideReceiptAction,
  analyticsHideReceiptConfirmAction
} from "../analytics/utils";
import { hidePaymentsReceiptAction } from "../store/actions";

type Props = {
  isCart?: boolean;
  transactionId: string;
  trigger?: HideReceiptTrigger;
};

const HideReceiptButton = (props: Props) => {
  const { transactionId, trigger = "tap", isCart = false } = props;
  const dispatch = useDispatch();
  const navigation = useIONavigation();
  const paymentAnalyticsData = useIOSelector(paymentAnalyticsDataSelector);

  const hideReceipt = () => {
    navigation.goBack();

    analyticsHideReceiptConfirmAction(paymentAnalyticsData);

    dispatch(
      hidePaymentsReceiptAction.request({
        transactionId,
        trigger
      })
    );
  };

  const handleHideFromList = () => {
    analyticsHideReceiptAction(paymentAnalyticsData);

    Alert.alert(
      I18n.t(
        isCart
          ? "features.payments.transactions.receipt.hideBanner.isCart.title"
          : "features.payments.transactions.receipt.hideBanner.title"
      ),
      I18n.t(
        isCart
          ? "features.payments.transactions.receipt.hideBanner.isCart.content"
          : "features.payments.transactions.receipt.hideBanner.content"
      ),
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
    <ContentWrapper>
      <ListItemAction
        accessibilityLabel={I18n.t(
          "features.payments.transactions.receipt.hideFromList"
        )}
        icon="eyeHide"
        label={I18n.t("features.payments.transactions.receipt.hideFromList")}
        onPress={handleHideFromList}
        variant="danger"
      />
    </ContentWrapper>
  );
};
export default HideReceiptButton;
