import { useEffect, useMemo } from "react";
import i18n from "i18next";
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
  const { startReading, stopReading, readStatus, progress, data } =
    useCieInternalAuthAndMrtdReading();

  const isCieScanningFlow = currentFlow === sendAARFlowStates.cieScanning;

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
    void startReading(can, verificationCode, "hex");
  }, [can, verificationCode, startReading]);

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

  const contentMap: {
    [K in ReadStatus]: Omit<CieCardReadContentProps, "progress">;
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
      // TODO: [IOCOM-2752] Handle errors
      [ReadStatus.ERROR]: {
        pictogram: "attention",
        title: "Qualcosa è andato storto.",
        secondaryAction: {
          variant: "link",
          label: i18n.t("global.buttons.close"),
          onPress: () => {
            terminateFlow();
          }
        }
      }
    }),
    [cancelAction, terminateFlow]
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

  return <CieCardReadContent progress={progress} {...contentMap[readStatus]} />;
};
