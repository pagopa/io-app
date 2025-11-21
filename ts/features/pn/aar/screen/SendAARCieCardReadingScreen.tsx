import { useCallback, useEffect, useMemo } from "react";
import i18n from "i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ReadStatus,
  useCieInternalAuthAndMrtdReading
} from "../hooks/useCieInternalAuthAndMrtdReading";
import {
  CieCardReadContent,
  CieCardReadContentProps
} from "../../../common/components/cie/CieCardReadContent";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { currentAARFlowStateType } from "../store/selectors";
import { RecipientInfo, sendAARFlowStates } from "../utils/stateUtils";
import { SendAARLoadingComponent } from "../components/SendAARLoadingComponent";
import { setAarFlowState } from "../store/actions";
import { isDefined } from "../../../../utils/guards";
import { useSendAarFlowManager } from "../hooks/useSendAarFlowManager";
import type { PnParamsList } from "../../navigation/params";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import PN_ROUTES from "../../navigation/routes";

type ScreenContentProps = Omit<CieCardReadContentProps, "progress">;

export type SendAARCieCardReadingScreenRouteParams = Readonly<{
  iun: string;
  mandateId: string;
  recipientInfo: RecipientInfo;
  can: string;
  verificationCode: string;
}>;

type SendAARCieCardReadingScreenProps = IOStackNavigationRouteProps<
  PnParamsList,
  typeof PN_ROUTES.SEND_AAR_CIE_CARD_READING
>;

export const SendAARCieCardReadingScreen = ({
  route
}: SendAARCieCardReadingScreenProps) => {
  const { can, verificationCode, iun, recipientInfo, mandateId } = route.params;
  const dispatch = useIODispatch();
  const { terminateFlow } = useSendAarFlowManager();
  const currentFlow = useIOSelector(currentAARFlowStateType);
  const { startReading, stopReading, readStatus, progress, data, error } =
    useCieInternalAuthAndMrtdReading();

  const isCieScanningFlow = currentFlow === sendAARFlowStates.cieScanning;

  const handleStartReading = useCallback(() => {
    void startReading(can, verificationCode, "hex");
  }, [can, startReading, verificationCode]);

  useEffect(() => {
    if (readStatus === ReadStatus.SUCCESS && isDefined(data)) {
      const { signedChallenge, ...nisData } = data.nis_data;

      dispatch(
        setAarFlowState({
          type: sendAARFlowStates.validatingMandate,
          iun,
          recipientInfo,
          mandateId,
          mrtdData: data.mrtd_data,
          nisData,
          signedVerificationCode: signedChallenge
        })
      );
    }
  }, [readStatus, data, iun, recipientInfo, mandateId, dispatch]);

  useEffect(() => {
    handleStartReading();
  }, [handleStartReading]);

  const cancelAction = useMemo(
    () => ({
      variant: "link",
      label: i18n.t("global.buttons.close"),
      onPress: () => {
        stopReading();
        // TODO: navigate back
      }
    }),
    [stopReading]
  );

  const generateErrorContent = useCallback((): ScreenContentProps => {
    switch (error?.name) {
      case "TAG_LOST":
        return {
          pictogram: "empty",
          title: i18n.t(
            "features.pn.aar.flow.cieScanning.error.TAG_LOST.title"
          ),
          subtitle: i18n.t(
            "features.pn.aar.flow.cieScanning.error.TAG_LOST.subtitle"
          ),
          primaryAction: {
            label: i18n.t("global.buttons.retry"),
            onPress: handleStartReading
          },
          secondaryAction: cancelAction
        };
      default:
        // TODO: [IOCOM-2752] Handle errors
        return {
          pictogram: "attention",
          title: "Qualcosa è andato storto.",
          secondaryAction: {
            label: i18n.t("global.buttons.close"),
            onPress: () => {
              terminateFlow();
            }
          }
        };
    }
  }, [error?.name, cancelAction, handleStartReading, terminateFlow]);

  const contentMap: {
    [K in ReadStatus]: ScreenContentProps;
  } = useMemo(
    () => ({
      [ReadStatus.IDLE]: {
        title: i18n.t("features.pn.aar.flow.cieScanning.idle.title"),
        pictogram: "nfcScanAndroid",
        secondaryAction: cancelAction
      },
      [ReadStatus.READING]: {
        title: i18n.t("features.pn.aar.flow.cieScanning.reading.title"),
        subtitle: i18n.t("features.pn.aar.flow.cieScanning.reading.subtitle"),
        pictogram: "nfcScanAndroid",
        secondaryAction: cancelAction
      },
      [ReadStatus.SUCCESS]: {
        title: i18n.t("features.pn.aar.flow.cieScanning.success.title"),
        pictogram: "success"
      },
      [ReadStatus.ERROR]: generateErrorContent()
    }),
    [cancelAction, generateErrorContent]
  );

  if (!isCieScanningFlow) {
    return (
      <SendAARLoadingComponent
        contentTitle={i18n.t(
          "features.pn.aar.flow.validatingMandate.loadingText"
        )}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <CieCardReadContent
        progress={progress}
        hiddenProgressBar={readStatus === ReadStatus.ERROR}
        {...contentMap[readStatus]}
      />
    </SafeAreaView>
  );
};
