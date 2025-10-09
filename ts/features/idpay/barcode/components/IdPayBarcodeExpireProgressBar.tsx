import { BodySmall, VSpacer } from "@pagopa/io-app-design-system";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import I18n from "i18next";
import { ProgressBar } from "../../../bonus/common/components/ProgressBar";
import { calculateIdPayBarcodeSecondsToExpire } from "../utils";
import { TransactionBarCodeResponse } from "../../../../../definitions/idpay/TransactionBarCodeResponse";

type Props = {
  barcode: TransactionBarCodeResponse;
  secondsExpirationTotal: number;
  setIsExpired: (isExpired: boolean) => void;
};

export const IdPayBarcodeExpireProgressBar = ({
  barcode,
  secondsExpirationTotal,
  setIsExpired
}: Props) => {
  const [seconds, setSeconds] = useState(
    calculateIdPayBarcodeSecondsToExpire(barcode)
  );
  const isCodeExpired = seconds === 0;
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(currentSecs => currentSecs - 1);
      setSeconds(calculateIdPayBarcodeSecondsToExpire(barcode));
    }, 1000);
    if (seconds <= 0) {
      setSeconds(0);
      clearInterval(timer);
      setIsExpired(true);
    }
    return () => clearInterval(timer);
    // possible over-engineering, but we actually
    // only need to run zero checks once the code is expired,
    // there is no reason to rerun this hook every second
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCodeExpired]);
  const formattedSecondsToExpiration = format(
    new Date(seconds * 1000),
    "mm:ss"
  );
  return (
    <View style={{ alignContent: "center" }}>
      <ProgressBar progressPercentage={seconds / secondsExpirationTotal} />
      <VSpacer size={8} />
      <View style={styles.centeredRow}>
        <BodySmall weight="Regular">
          {I18n.t("idpay.barCode.resultScreen.success.expiresIn")}
        </BodySmall>
        <BodySmall weight="Semibold">{formattedSecondsToExpiration}</BodySmall>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredRow: { flexDirection: "row", justifyContent: "center" }
});
