import { ContentWrapper, ListItemAction } from "@pagopa/io-app-design-system";
import { Alert } from "react-native";
import { useDispatch } from "react-redux";
import I18n from "i18next";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { paymentAnalyticsDataSelector } from "../../history/store/selectors";
import {
  analyticsHideReceiptAction,
  analyticsHideReceiptConfirmAction
} from "../analytics/utils";
import { hidePaymentsReceiptAction } from "../store/actions";
import { HideReceiptTrigger } from "../analytics";

type Props = {
  transactionId: string;
  isCart?: boolean;
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
        label={I18n.t("features.payments.transactions.receipt.hideFromList")}
        onPress={handleHideFromList}
        accessibilityLabel={I18n.t(
          "features.payments.transactions.receipt.hideFromList"
        )}
        icon="eyeHide"
        variant="danger"
      />
    </ContentWrapper>
  );
};
export default HideReceiptButton;
