import { useCallback, useEffect, useMemo } from "react";
import i18n from "i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { IOColors, useIOTheme } from "@pagopa/io-app-design-system";
import {
  isErrorState,
  isReadingState,
  isSuccessState,
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
  const theme = useIOTheme();
  const { terminateFlow } = useSendAarFlowManager();
  const { startReading, stopReading, readState } =
    useCieInternalAuthAndMrtdReading();

  const isError = isErrorState(readState);
  const data = isSuccessState(readState) ? readState.data : undefined;
  const errorName = isError ? readState.error.name : undefined;
  const progress = isReadingState(readState) ? readState.progress : 0;

  const handleStartReading = useCallback(() => {
    void startReading(can, verificationCode, "base64url");
  }, [can, startReading, verificationCode]);

  useEffect(() => {
    if (isDefined(data)) {
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
  }, [data, iun, recipientInfo, mandateId, dispatch]);

  useEffect(() => {
    handleStartReading();
  }, [handleStartReading]);

  const cancelAction = useMemo<ScreenContentProps["secondaryAction"]>(
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

  const contentMap: {
    [K in ReadStatus]: ScreenContentProps;
  } = useMemo(() => {
    const generateErrorContent = (): ScreenContentProps => {
      switch (errorName) {
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
    };

    return {
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
    };
  }, [cancelAction, errorName, terminateFlow, handleStartReading]);

  return (
    <SafeAreaView
      style={[
        { flex: 1 },
        { backgroundColor: IOColors[theme["appBackground-primary"]] }
      ]}
    >
      <CieCardReadContent
        progress={progress}
        hiddenProgressBar={isError}
        {...contentMap[readState.status]}
      />
    </SafeAreaView>
  );
};
