import React from "react";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import I18n from "../../../../i18n";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { useItwDisbleGestureNavigation } from "../../common/hooks/useItwDisbleGestureNavigation";

export const ItwIssuanceEidRequestScreen = () => {
  useItwDisbleGestureNavigation();
  useAvoidHardwareBackButton();

  return (
    <LoadingScreenContent contentTitle={I18n.t("global.genericWaiting")} />
  );
};
