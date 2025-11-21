import { useCallback, useEffect, useMemo } from "react";
import i18n from "i18next";
import {
  ReadStatus,
  useCieInternalAuthAndMrtdReading
} from "../hooks/useCieInternalAuthAndMrtdReading";
import {
  CieCardReadContent,
  CieCardReadContentProps
} from "../../../common/components/cie/CieCardReadContent";
import { useIODispatch } from "../../../../store/hooks";
import { RecipientInfo, sendAARFlowStates } from "../utils/stateUtils";
import { setAarFlowState } from "../store/actions";
import { isDefined } from "../../../../utils/guards";
import { useSendAarFlowManager } from "../hooks/useSendAarFlowManager";

type ScreenContentProps = Omit<CieCardReadContentProps, "progress">;

export type SendAARCieCardReadingComponentProps = {
  iun: string;
  mandateId: string;
  recipientInfo: RecipientInfo;
  can: string;
  verificationCode: string;
};

export const SendAARCieCardReadingComponent = ({
  can,
  verificationCode,
  iun,
  recipientInfo,
  mandateId
}: SendAARCieCardReadingComponentProps) => {
  const dispatch = useIODispatch();
  const { terminateFlow } = useSendAarFlowManager();
  const { startReading, stopReading, readStatus, progress, data, error } =
    useCieInternalAuthAndMrtdReading();

  const handleStartReading = useCallback(() => {
    void startReading(can, verificationCode, "base64url");
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

  return (
    <CieCardReadContent
      progress={progress}
      hiddenProgressBar={readStatus === ReadStatus.ERROR}
      {...contentMap[readStatus]}
    />
  );
};
