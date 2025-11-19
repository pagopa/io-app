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
import {
  aarCieScanningStateSelector,
  currentAARFlowData
} from "../store/selectors";
import { sendAARFlowStates } from "../utils/stateUtils";
import { SendAARLoadingComponent } from "../components/SendAARLoadingComponent";
import { setAarFlowState } from "../store/actions";
import { isDefined } from "../../../../utils/guards";
import { useSendAarFlowManager } from "../hooks/useSendAarFlowManager";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { PnParamsList } from "../../navigation/params";

type Props = {
  navigation: IOStackNavigationProp<PnParamsList, "SEND_AAR_CIE_CARD_READING">;
};

export const SendAARCieCardReadingScreen = ({ navigation }: Props) => {
  const dispatch = useIODispatch();
  const { terminateFlow } = useSendAarFlowManager();
  const maybeCieScanningState = useIOSelector(aarCieScanningStateSelector);
  const { startReading, stopReading, readStatus, progress, data } =
    useCieInternalAuthAndMrtdReading();

  useEffect(() => {
    if (
      readStatus === ReadStatus.SUCCESS &&
      isDefined(maybeCieScanningState) &&
      isDefined(data)
    ) {
      const { iun, recipientInfo, mandateId } = maybeCieScanningState;

      dispatch(
        setAarFlowState({
          type: sendAARFlowStates.validatingMandate,
          iun,
          recipientInfo,
          mandateId,
          mrtdData: data.mrtd_data,
          nisData: data.nis_data,
          signedVerificationCode: data.nis_data.signedChallenge
        })
      );
    }
  }, [readStatus, data, maybeCieScanningState, dispatch]);

  useEffect(() => {
    if (maybeCieScanningState?.can && maybeCieScanningState.verificationCode) {
      void startReading(
        maybeCieScanningState.can,
        maybeCieScanningState.verificationCode,
        "hex"
      );
    }
  }, [
    maybeCieScanningState?.can,
    maybeCieScanningState?.verificationCode,
    startReading
  ]);

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
        pictogram: "nfcScaniOS",
        secondaryAction: cancelAction
      },
      [ReadStatus.READING]: {
        title: i18n.t("features.pn.aar.flow.cieScanning.reading.title"),
        subtitle: i18n.t("features.pn.aar.flow.cieScanning.reading.subtitle"),
        pictogram: "nfcScaniOS",
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
            navigation.popToTop();
          }
        }
      }
    }),
    [cancelAction, terminateFlow, navigation]
  );

  if (!isDefined(maybeCieScanningState)) {
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
