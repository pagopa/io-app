import I18n from "i18next";

import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";

const CieExpiredOrInvalidScreen = () => {
  const navigation = useIONavigation();

  return (
    <OperationResultScreenContent
      action={{
        label: I18n.t("global.buttons.close"),
        accessibilityLabel: I18n.t("global.buttons.close"),
        onPress: navigation.popToTop
      }}
      pictogram="attention"
      subtitle={I18n.t("authentication.landing.expiredCardContent")}
      title={I18n.t("authentication.landing.expiredCardTitle")}
    />
  );
};

export default CieExpiredOrInvalidScreen;
