import React, { useCallback } from "react";
import I18n from "../../../../../i18n";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";

export const ItwCieExpiredOrInvalidScreen = () => {
  const navigation = useIONavigation();

  const handleClose = useCallback(() => {
    // TODO: handle correct navigation
    // navigation.navigate(ROUTES.MAIN);
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
