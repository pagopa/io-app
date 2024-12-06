import { BodySmall, VSpacer } from "@pagopa/io-app-design-system";
import { format } from "date-fns";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../../../../i18n";
import { ProgressBar } from "../../../bonus/common/components/ProgressBar";

type Props = {
  secondsToExpiration: number;
  secondsExpirationTotal: number;
  setIsExpired: (isExpired: boolean) => void;
};

export const IdPayBarcodeExpireProgressBar = ({
  secondsToExpiration,
  secondsExpirationTotal,
  setIsExpired
}: Props) => {
  const [seconds, setSeconds] = React.useState(secondsToExpiration);
  const isCodeExpired = seconds === 0;
  React.useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(currentSecs => currentSecs - 1);
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
        <BodySmall weight="Regular" color="black">
          {I18n.t("idpay.barCode.resultScreen.success.expiresIn")}
        </BodySmall>
        <BodySmall weight="Semibold" color="black">
          {formattedSecondsToExpiration}
        </BodySmall>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredRow: { flexDirection: "row", justifyContent: "center" }
});
