import { Body, HSpacer, Icon, IOStyles } from "@pagopa/io-app-design-system";
import { format } from "date-fns";
import { useMemo } from "react";
import { View } from "react-native";
import Placeholder from "rn-placeholder";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import I18n from "../../../../i18n";
import { ItwTrustmarkMachineContext } from "../machine/provider";
import { selectExpirationSeconds, selectFailure } from "../machine/selectors";
import IOMarkdown from "../../../../components/IOMarkdown";

/**
 * Timer that shows the remaining time before the trustmark expires
 */
const ItwTrustmarkExpirationTimer = () => {
  const expirationSeconds = ItwTrustmarkMachineContext.useSelector(
    selectExpirationSeconds
  );
  const failure = ItwTrustmarkMachineContext.useSelector(selectFailure);

  useDebugInfo({ expirationSeconds, failure });

  const content = useMemo(() => {
    if (failure) {
      return <Body>{I18n.t("features.itWallet.trustmark.timer.expired")}</Body>;
    }

    if (expirationSeconds === undefined) {
      return (
        <Placeholder.Box height={18} width={200} animate="fade" radius={4} />
      );
    }

    return (
      <IOMarkdown
        content={I18n.t("features.itWallet.trustmark.timer.expiresIn", {
          time: format(new Date(expirationSeconds * 1000), "mm:ss")
        })}
      />
    );
  }, [failure, expirationSeconds]);

  return (
    <View style={[IOStyles.row, IOStyles.alignCenter]}>
      <Icon name="history" size={24} color="grey-300" />
      <HSpacer size={24} />
      {content}
    </View>
  );
};

export { ItwTrustmarkExpirationTimer };
