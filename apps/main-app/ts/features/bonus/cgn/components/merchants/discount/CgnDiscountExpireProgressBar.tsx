import { BodySmall, VSpacer } from "@pagopa/io-app-design-system";
import { format } from "date-fns";
import I18n from "i18next";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { ProgressBar } from "../../../../common/components/ProgressBar";

type Props = {
  secondsExpirationTotal: number;
  secondsToExpiration: number;
  setIsExpired: (isExpired: boolean) => void;
};

export const CgnDiscountExpireProgressBar = ({
  secondsToExpiration,
  secondsExpirationTotal,
  setIsExpired
}: Props) => {
  const [seconds, setSeconds] = useState(secondsToExpiration);
  const isCodeExpired = seconds <= 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(currentSecs => currentSecs - 1);
    }, 1000);
    if (seconds <= 0) {
      setSeconds(0);
      clearInterval(timer);
      setIsExpired(true);
    }
    return () => clearInterval(timer);
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
      <View style={{ flexDirection: "row", justifyContent: "center" }}>
        <BodySmall color="black" weight="Regular">
          {I18n.t("idpay.barCode.resultScreen.success.expiresIn")}
        </BodySmall>
        <BodySmall color="black" weight="Semibold">
          {formattedSecondsToExpiration}
        </BodySmall>
      </View>
    </View>
  );
};
