import React from "react";
import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";
import I18n from "../../../../i18n";

export const ItwIssuanceEidRequestScreen = () => (
  <LoadingScreenContent contentTitle={I18n.t("global.genericWaiting")} />
);
