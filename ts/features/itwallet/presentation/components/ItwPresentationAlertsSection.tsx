import { Alert, VStack } from "@pagopa/io-app-design-system";
import React, { useCallback } from "react";
import {
  getCredentialExpireDays,
  getCredentialStatus
} from "../../common/utils/itwClaimsUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import I18n from "../../../../i18n";
import { ItwCredentialIssuanceMachineContext } from "../../machine/provider";
import { trackWalletPgValidityInfo } from "../../analytics";

type Props = {
  credential: StoredCredential;
};

export const ItwPresentationAlertsSection = ({ credential }: Props) => {
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();

  const beginCredentialIssuance = () => {
    machineRef.send({
      type: "select-credential",
      credentialType: credential.credentialType,
      skipNavigation: false
    });
  };

  const isMdl = credential.credentialType === CredentialType.DRIVING_LICENSE;
  const isEhc =
    credential.credentialType === CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD;

  const expireStatus = getCredentialStatus(credential);
  const expireDays = getCredentialExpireDays(credential.parsedCredential);
  const isExpired = expireStatus === "expired";
  const isExpiring = expireStatus === "expiring";

  const onPressWithMixpanelEvent = useCallback(
    (callback: () => void) => {
      if (isMdl) {
        trackWalletPgValidityInfo();
      }
      return callback;
    },
    [isMdl]
  );

  if (isExpired) {
    return (
      <Alert
        testID="itwExpiredBannerTestID"
        content={I18n.t(
          "features.itWallet.presentation.alerts.expired.content"
        )}
        variant="error"
        action={I18n.t("features.itWallet.presentation.alerts.expired.action")}
        onPress={onPressWithMixpanelEvent(beginCredentialIssuance)}
      />
    );
  }

  return (
    <VStack space={16}>
      {isExpiring && (
        <Alert
          testID="itwExpiringBannerTestID"
          content={I18n.t(
            "features.itWallet.presentation.alerts.expiring.content",
            {
              days: expireDays
            }
          )}
          variant="warning"
        />
      )}
      {isMdl && (
        // TODO this alert does not have cta anymore
        <Alert
          testID="itwMdlBannerTestID"
          content={I18n.t("features.itWallet.presentation.alerts.mdl.content")}
          variant="info"
        />
      )}
      {isEhc && (
        <Alert
          testID="itwEhcBannerTestID"
          content={I18n.t("features.itWallet.presentation.alerts.ehc.content")}
          variant="info"
        />
      )}
    </VStack>
  );
};
