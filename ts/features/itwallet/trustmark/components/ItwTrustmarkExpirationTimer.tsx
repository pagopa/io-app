import { Body, HSpacer, Icon, IOStyles } from "@pagopa/io-app-design-system";
import { format } from "date-fns";
import React from "react";
import { View } from "react-native";
import Placeholder from "rn-placeholder";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import I18n from "../../../../i18n";
import { ItwTrustmarkMachineContext } from "../machine/provider";
import { selectExpirationSeconds, selectFailure } from "../machine/selectors";

/**
 * Timer that shows the remaining time before the trustmark expires
 */
const ItwTrustmarkExpirationTimer = () => {
  const expirationSeconds = ItwTrustmarkMachineContext.useSelector(
    selectExpirationSeconds
  );
  const failure = ItwTrustmarkMachineContext.useSelector(selectFailure);

  useDebugInfo({ expirationSeconds, failure });

  // Format the expiration time to mm:ss and show a placeholder if the expiration time is undefined
  const formattedExpirationTime =
    expirationSeconds !== undefined ? (
      <Body weight="Semibold">
        {format(new Date(expirationSeconds * 1000), "mm:ss")}
      </Body>
    ) : (
      <Placeholder.Box height={18} width={40} animate="fade" radius={4} />
    );

  return (
    <View style={[IOStyles.row, IOStyles.alignCenter]}>
      <Icon name="history" size={24} color="grey-300" />
      <HSpacer size={24} />
      {failure ? (
        <Body>{I18n.t("features.itWallet.trustmark.timer.expired")}</Body>
      ) : (
        <Body>
          {I18n.t("features.itWallet.trustmark.timer.expiresIn", {
            time: formattedExpirationTime
          })}
        </Body>
      )}
    </View>
  );
};

export { ItwTrustmarkExpirationTimer };
