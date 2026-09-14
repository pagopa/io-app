import I18n from "i18next";
import { useLayoutEffect, useMemo } from "react";
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
import {
  trackItwFallbackL2Flow,
  trackItwFallbackL2FlowExit,
  trackItwFallbackL2FlowStart,
  trackItwUserWithoutL3Requirements
} from "../../analytics";
import { CieWarningType } from "../utils/types";

export type ItwIdentificationCieWarningScreenNavigationParams = {
  routeName: string;
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
  const { type, routeName } = params.route.params;
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

  const copy = useMemo(() => {
    if (type === "card" && isCieRequired) {
      return {
        primaryAction: I18n.t(
          "features.itWallet.identification.cie.warning.card.ko-no-cie.primaryAction"
        ),
        secondaryAction: I18n.t(
          "features.itWallet.identification.cie.warning.card.ko-no-cie.secondaryAction"
        ),
        subtitle: I18n.t(
          "features.itWallet.identification.cie.warning.card.ko-no-cie.subtitle"
        ),
        title: I18n.t(
          "features.itWallet.identification.cie.warning.card.ko-no-cie.title"
        )
      };
    }
    if (type === "card" && !isCieRequired) {
      return {
        primaryAction: I18n.t(
          "features.itWallet.identification.cie.warning.card.l2-fallback.primaryAction"
        ),
        secondaryAction: I18n.t(
          "features.itWallet.identification.cie.warning.card.l2-fallback.secondaryAction"
        ),
        subtitle: I18n.t(
          "features.itWallet.identification.cie.warning.card.l2-fallback.subtitle"
        ),
        title: I18n.t(
          "features.itWallet.identification.cie.warning.card.l2-fallback.title"
        )
      };
    }
    if (type === "pin" && isCieRequired) {
      return {
        primaryAction: I18n.t(
          "features.itWallet.identification.cie.warning.pin.ko-no-cie.primaryAction"
        ),
        secondaryAction: I18n.t(
          "features.itWallet.identification.cie.warning.pin.ko-no-cie.secondaryAction"
        ),
        subtitle: I18n.t(
          "features.itWallet.identification.cie.warning.pin.ko-no-cie.subtitle"
        ),
        title: I18n.t(
          "features.itWallet.identification.cie.warning.pin.ko-no-cie.title"
        )
      };
    }
    return {
      primaryAction: I18n.t(
        "features.itWallet.identification.cie.warning.pin.l2-fallback.primaryAction"
      ),
      secondaryAction: I18n.t(
        "features.itWallet.identification.cie.warning.pin.l2-fallback.secondaryAction"
      ),
      subtitle: I18n.t(
        "features.itWallet.identification.cie.warning.pin.l2-fallback.subtitle"
      ),
      title: I18n.t(
        "features.itWallet.identification.cie.warning.pin.l2-fallback.title"
      )
    };
  }, [type, isCieRequired]);

  useLayoutEffect(() => {
    if (isCieRequired) {
      trackItwUserWithoutL3Requirements({
        screen_name: routeName,
        reason,
        position: "screen"
      });
    } else {
      trackItwFallbackL2Flow({
        fallback_reason: "user_without_cie"
      });
    }
  }, [reason, routeName, isCieRequired]);

  const handlePrimaryActionPress = () => {
    if (isCieRequired) {
      trackItwKoStateAction({
        reason,
        cta_category: "custom_1",
        cta_id: copy.primaryAction
      });
      void Linking.openURL(cieFaqUrls[type]);
    } else {
      trackItwFallbackL2FlowStart({
        fallback_reason: "user_without_cie"
      });
      if (credentialType) {
        credentialMachineRef.send({
          type: "select-credential",
          credentialType,
          mode: "issuance"
        });
      }
    }
  };

  const handleSecondaryActionPress = () => {
    if (isCieRequired) {
      trackItwKoStateAction({
        reason,
        cta_category: "custom_2",
        cta_id: copy.secondaryAction
      });
    } else {
      trackItwFallbackL2FlowExit({
        fallback_reason: "user_without_cie"
      });
    }

    machineRef.send({
      type: "close"
    });
  };

  useHeaderSecondLevel({
    title: ""
  });

  return (
    <OperationResultScreenContent
      action={{
        label: copy.primaryAction,
        onPress: handlePrimaryActionPress
      }}
      isHeaderVisible={true}
      pictogram={isCieRequired ? "attention" : "cardAdd"}
      secondaryAction={{
        label: copy.secondaryAction,
        onPress: handleSecondaryActionPress
      }}
      subtitle={copy.subtitle}
      title={copy.title}
    />
  );
};
