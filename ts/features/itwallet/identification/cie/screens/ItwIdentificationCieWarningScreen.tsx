import I18n from "i18next";
import { useMemo } from "react";
import { Linking } from "react-native";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList";
import { trackItwKoStateAction } from "../../../analytics";
import { isL2Credential } from "../../../common/utils/itwCredentialUtils";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/credential/provider";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import {
  isL3FeaturesEnabledSelector,
  selectCredentialType
} from "../../../machine/eid/selectors";
import { ItwParamsList } from "../../../navigation/ItwParamsList";
import { CieWarningType } from "../utils/types";

export type ItwIdentificationCieWarningScreenNavigationParams = {
  type: CieWarningType;
};

type ScreenProps = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_IDENTIFICATION_CIE_WARNING"
>;

const cieFaqUrls: Record<CieWarningType, string> = {
  pin: "https://assistenza.ioapp.it/hc/it/articles/30724125085713-Ho-dimenticato-il-PIN-della-CIE",
  // TODO: update the URL when the new one is available
  card: "https://assistenza.ioapp.it/hc/it/articles/30724116346129-Cos-%C3%A8-la-CIE-e-come-richiederla"
};

export const ItwIdentificationCieWarningScreen = (params: ScreenProps) => {
  const { type } = params.route.params;
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const credentialMachineRef =
    ItwCredentialIssuanceMachineContext.useActorRef();
  const isL3FeaturesEnabled = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );
  const credentialType =
    ItwEidIssuanceMachineContext.useSelector(selectCredentialType);
  const reason = type === "card" ? "user_without_cie" : "user_without_pin";

  const isCieRequired = useMemo(
    () => isL3FeaturesEnabled && !isL2Credential(credentialType),
    [isL3FeaturesEnabled, credentialType]
  );

  const sectionKey = isCieRequired ? "ko-no-cie" : "l2-fallback";

  const handlePrimaryActionPress = () => {
    trackItwKoStateAction({
      reason,
      cta_category: "custom_1",
      cta_id: I18n.t(
        `features.itWallet.identification.cie.warning.${type}.${sectionKey}.primaryAction`
      )
    });
    if (isCieRequired) {
      void Linking.openURL(cieFaqUrls[type]);
    } else if (credentialType) {
      credentialMachineRef.send({
        type: "select-credential",
        credentialType,
        mode: "issuance"
      });
    }
  };

  const handleSecondaryActionPress = () => {
    trackItwKoStateAction({
      reason,
      cta_category: "custom_2",
      cta_id: I18n.t(
        `features.itWallet.identification.cie.warning.${type}.${sectionKey}.secondaryAction`
      )
    });
    machineRef.send({
      type: "close"
    });
  };

  useHeaderSecondLevel({
    title: ""
  });

  return (
    <OperationResultScreenContent
      title={I18n.t(
        `features.itWallet.identification.cie.warning.${type}.${sectionKey}.title`
      )}
      subtitle={I18n.t(
        `features.itWallet.identification.cie.warning.${type}.${sectionKey}.subtitle`
      )}
      pictogram={isCieRequired ? "attention" : "cardAdd"}
      action={{
        label: I18n.t(
          `features.itWallet.identification.cie.warning.${type}.${sectionKey}.primaryAction`
        ),
        onPress: handlePrimaryActionPress
      }}
      secondaryAction={{
        label: I18n.t(
          `features.itWallet.identification.cie.warning.${type}.${sectionKey}.secondaryAction`
        ),
        onPress: handleSecondaryActionPress
      }}
      isHeaderVisible={true}
    />
  );
};
