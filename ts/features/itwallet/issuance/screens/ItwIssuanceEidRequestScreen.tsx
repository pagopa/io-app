import React from "react";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import I18n from "../../../../i18n";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";

export const ItwIssuanceEidRequestScreen = () => {
  useAvoidHardwareBackButton();

  return (
    <LoadingScreenContent contentTitle={I18n.t("global.genericWaiting")} />
  );
};
