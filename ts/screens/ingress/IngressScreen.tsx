/**
 * An ingress screen to choose the real first screen the user must navigate to.
 */
import React, { useEffect, useState } from "react";
import { fetch, NetInfoState } from "@react-native-community/netinfo";
import I18n from "../../i18n";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { trackIngressScreen } from "../profile/analytics";
import SectionStatusComponent from "../../components/SectionStatus";
import LoadingScreenContent from "../../components/screens/LoadingScreenContent";
import { OperationResultScreenContent } from "../../components/screens/OperationResultScreenContent";

export const IngressScreen = () => {
  const [netInfo, setNetInfo] = useState<NetInfoState>();
  const contentTitle = I18n.t("startup.title");
  useOnFirstRender(() => {
    trackIngressScreen();
  });

  useEffect(() => {
    void fetch().then(setNetInfo).catch();
  }, []);

  if (netInfo && !netInfo.isConnected) {
    return (
      <OperationResultScreenContent
        testID="device-connection-lost-id"
        pictogram="lostConnection"
        title={I18n.t("startup.connection_lost.title")}
        subtitle={I18n.t("startup.connection_lost.description")}
      />
    );
  }

  return (
    <LoadingScreenContent
      testID="ingress-screen-loader-id"
      contentTitle={contentTitle}
    >
      <SectionStatusComponent sectionKey={"ingress"} />
    </LoadingScreenContent>
  );
};
