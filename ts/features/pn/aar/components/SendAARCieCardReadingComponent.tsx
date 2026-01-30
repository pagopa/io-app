import { IOColors, useIOTheme } from "@pagopa/io-app-design-system";
import i18n from "i18next";
import { useCallback, useEffect, useMemo } from "react";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIODispatch } from "../../../../store/hooks";
import { isDefined } from "../../../../utils/guards";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import {
  CieCardReadContent,
  CieCardReadContentProps
} from "../../../common/components/cie/CieCardReadContent";
import {
  isErrorState,
  isReadingState,
  isSuccessState,
  ReadStatus,
  useCieInternalAuthAndMrtdReading
} from "../hooks/useCieInternalAuthAndMrtdReading";
import { setAarFlowState } from "../store/actions";
import { RecipientInfo, sendAARFlowStates } from "../utils/stateUtils";
import { sendAarErrorSupportBottomSheetComponent } from "./errors/SendAARErrorComponent";

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
  const { startReading, stopReading, readState } =
    useCieInternalAuthAndMrtdReading();

  const isError = isErrorState(readState);
  const data = isSuccessState(readState) ? readState.data : undefined;
  const errorName = isError ? readState.error.name : undefined;
  const progress = isReadingState(readState) ? readState.progress : 0;

  const handleZendeskAssistance = () => {
    dismiss();
  };
  const { bottomSheet, present, dismiss } = useIOBottomSheetModal({
    component: sendAarErrorSupportBottomSheetComponent(
      handleZendeskAssistance,
      errorName
    ),
    title: ""
  });
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
          unsignedVerificationCode: verificationCode,
          signedVerificationCode: signedChallenge
        })
      );
    }
  }, [data, iun, recipientInfo, mandateId, dispatch, verificationCode]);

  useEffect(() => {
    handleStartReading();
  }, [handleStartReading]);

  const restartToCanAdvisory = useCallback(() => {
    stopReading();
    dispatch(
      setAarFlowState({
        type: sendAARFlowStates.cieCanAdvisory,
        iun,
        recipientInfo,
        mandateId,
        verificationCode
      })
    );
  }, [dispatch, iun, mandateId, recipientInfo, stopReading, verificationCode]);
  const restartToScanningAdvisory = useCallback(() => {
    stopReading();
    dispatch(
      setAarFlowState({
        type: sendAARFlowStates.cieScanningAdvisory,
        iun,
        recipientInfo,
        mandateId,
        can,
        verificationCode
      })
    );
  }, [
    can,
    dispatch,
    iun,
    mandateId,
    recipientInfo,
    stopReading,
    verificationCode
  ]);

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
            secondaryAction: {
              testID: "tagLostCloseButton",
              label: i18n.t("global.buttons.close"),
              onPress: restartToScanningAdvisory
            }
          };
        case "WRONG_CAN":
          const platformizedSubtitle = Platform.select({
            ios: i18n.t(
              "features.pn.aar.flow.cieScanning.error.WRONG_CAN.subtitleIos"
            ),
            default: i18n.t(
              "features.pn.aar.flow.cieScanning.error.WRONG_CAN.subtitleAndroid"
            )
          });
          return {
            pictogram: "attention",
            title: i18n.t(
              "features.pn.aar.flow.cieScanning.error.WRONG_CAN.title"
            ),
            subtitle: platformizedSubtitle,
            primaryAction: {
              testID: "wrongCanRetryButton",
              label: i18n.t("global.buttons.retry"),
              onPress: handleStartReading
            },
            secondaryAction: {
              testID: "wrongCanCloseButton",
              label: i18n.t("global.buttons.close"),
              onPress: restartToCanAdvisory
            }
          };
        default:
          return {
            pictogram: "umbrella",
            title: i18n.t(
              "features.pn.aar.flow.cieScanning.error.GENERIC.title"
            ),
            subtitle: i18n.t(
              "features.pn.aar.flow.cieScanning.error.GENERIC.subtitle"
            ),
            primaryAction: {
              testID: "genericErrorPrimaryAction",
              label: i18n.t("global.buttons.close"),
              onPress: restartToCanAdvisory
            },
            secondaryAction: {
              testID: "genericErrorSecondaryAction",
              onPress: present,
              label: i18n.t(
                "features.pn.aar.flow.cieScanning.error.GENERIC.secondaryAction"
              )
            }
          };
      }
    };

    return {
      [ReadStatus.IDLE]: {
        title: i18n.t("features.pn.aar.flow.cieScanning.idle.title"),
        pictogram: "nfcScanAndroid",
        secondaryAction: {
          label: i18n.t("global.buttons.close"),
          onPress: restartToScanningAdvisory
        }
      },
      [ReadStatus.READING]: {
        title: i18n.t("features.pn.aar.flow.cieScanning.reading.title"),
        subtitle: i18n.t("features.pn.aar.flow.cieScanning.reading.subtitle"),
        pictogram: "nfcScanAndroid",
        secondaryAction: {
          label: i18n.t("global.buttons.close"),
          onPress: restartToScanningAdvisory
        }
      },
      [ReadStatus.SUCCESS]: {
        title: i18n.t("features.pn.aar.flow.cieScanning.success.title"),
        pictogram: "success"
      },
      [ReadStatus.ERROR]: generateErrorContent()
    };
  }, [
    restartToScanningAdvisory,
    errorName,
    handleStartReading,
    restartToCanAdvisory,
    present
  ]);

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
      {bottomSheet}
    </SafeAreaView>
  );
};
