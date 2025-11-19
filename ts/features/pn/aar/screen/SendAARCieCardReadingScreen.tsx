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
import { useIOSelector } from "../../../../store/hooks";
import { aarCanAndVerificationCodeSelector } from "../store/selectors";

export const SendAARCieCardReadingScreen = () => {
  const maybeCanAndVerificatonCode = useIOSelector(
    aarCanAndVerificationCodeSelector
  );
  const { startReading, stopReading, readStatus, progress } =
    useCieInternalAuthAndMrtdReading();

  useEffect(() => {
    if (
      maybeCanAndVerificatonCode?.can &&
      maybeCanAndVerificatonCode.verificationCode
    ) {
      void startReading(
        maybeCanAndVerificatonCode.can,
        maybeCanAndVerificatonCode.verificationCode,
        "hex"
      );
    }
  }, [
    maybeCanAndVerificatonCode?.can,
    maybeCanAndVerificatonCode?.verificationCode,
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
        title: "Poggia il retro del telefono sulla CIE",
        pictogram: "nfcScaniOS",
        secondaryAction: cancelAction
      },
      [ReadStatus.READING]: {
        title: "La lettura è in corso...",
        subtitle: "Non muovere il telefono.",
        pictogram: "nfcScaniOS",
        secondaryAction: cancelAction
      },
      [ReadStatus.SUCCESS]: {
        title: "Lettura completata!",
        pictogram: "success"
      },
      // TODO: [IOCOM-2752] Handle errors
      [ReadStatus.ERROR]: {
        pictogram: "attention",
        title: "Qualcosa è andato storto.",
        secondaryAction: cancelAction
      }
    }),
    [cancelAction]
  );

  return <CieCardReadContent progress={progress} {...contentMap[readStatus]} />;
};
