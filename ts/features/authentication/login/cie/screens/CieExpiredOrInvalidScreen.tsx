import { useCallback } from "react";
import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";

const CieExpiredOrInvalidScreen = () => {
  const navigation = useIONavigation();

  const handleClose = useCallback(() => {
    navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.LANDING
    });
  }, [navigation]);

  return (
    <OperationResultScreenContent
      pictogram="attention"
      title={I18n.t("authentication.landing.expiredCardTitle")}
      subtitle={I18n.t("authentication.landing.expiredCardContent")}
      action={{
        label: I18n.t("global.buttons.close"),
        accessibilityLabel: I18n.t("global.buttons.close"),
        onPress: handleClose
      }}
    />
  );
};

export default CieExpiredOrInvalidScreen;
