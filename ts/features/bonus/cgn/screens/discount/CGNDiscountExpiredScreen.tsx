import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";

const CGNDiscountExpiredScreen = () => {
  const navigate = useIONavigation();
  const onPress = () => navigate.pop();
  return (
    <OperationResultScreenContent
      pictogram="umbrella"
      title={I18n.t("bonus.cgn.merchantDetail.discount.error")}
      isHeaderVisible={false}
      action={{
        label: I18n.t("global.buttons.close"),
        onPress,
        testID: "close-button"
      }}
      enableAnimatedPictogram
      loop
    />
  );
};

export default CGNDiscountExpiredScreen;
