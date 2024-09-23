/* eslint-disable functional/immutable-data */
/**
 * An ingress screen to choose the real first screen the user must navigate to.
 */
import React, { useEffect, useState } from "react";
import {
  fetch as fetchNetInfo,
  NetInfoState
} from "@react-native-community/netinfo";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import I18n from "../../i18n";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { trackIngressScreen } from "../profile/analytics";
import SectionStatusComponent from "../../components/SectionStatus";
import LoadingScreenContent from "../../components/screens/LoadingScreenContent";
import { OperationResultScreenContent } from "../../components/screens/OperationResultScreenContent";
import { useIOSelector } from "../../store/hooks";
import { isBackendStatusLoadedSelector } from "../../store/reducers/backendStatus";

const TIMEOUT_CHANGE_LABEL = (5 * 1000) as Millisecond;
const TIMEOUT_BLOCKING_SCREEN = (10 * 1000) as Millisecond;

export const IngressScreen = () => {
  const isBackendStatusLoaded = useIOSelector(isBackendStatusLoadedSelector);
  const [netInfo, setNetInfo] = useState<NetInfoState>();
  const [showBlockingScreen, setShowBlockingScreen] = useState(false);
  const [contentTitle, setContentTitle] = useState(I18n.t("startup.title"));
  useOnFirstRender(() => {
    trackIngressScreen();
  });

  useEffect(() => {
    const timeouts: Array<number> = [];
    timeouts.push(
      setTimeout(() => {
        setContentTitle(I18n.t("startup.title2"));
        timeouts.shift();
      }, TIMEOUT_CHANGE_LABEL)
    );
    timeouts.push(
      setTimeout(() => {
        setShowBlockingScreen(true);
        timeouts.shift();
      }, TIMEOUT_BLOCKING_SCREEN)
    );
    void fetchNetInfo()
      .then(info => {
        if (!info.isConnected) {
          timeouts.forEach(clearTimeout);
        }
        setNetInfo(info);
      })
      .catch();

    return () => {
      timeouts?.forEach(clearTimeout);
    };
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

  if (showBlockingScreen) {
    return (
      <OperationResultScreenContent
        testID="device-blocking-screen-id"
        {...(isBackendStatusLoaded
          ? {
              pictogram: "time",
              title: I18n.t("startup.slowdowns_results_screen.title"),
              subtitle: I18n.t("startup.slowdowns_results_screen.subtitle")
            }
          : {
              pictogram: "umbrellaNew",
              title: I18n.t("startup.cdn_unreachable_results_screen.title"),
              subtitle: I18n.t(
                "startup.cdn_unreachable_results_screen.subtitle"
              )
            })}
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
