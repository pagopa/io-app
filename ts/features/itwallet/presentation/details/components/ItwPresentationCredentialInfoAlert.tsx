import { memo } from "react";
import { Alert } from "@pagopa/io-app-design-system";
import I18n from "../../../../../i18n.ts";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { itwCredentialStatusSelector } from "../../../credentials/store/selectors";
import { CredentialType } from "../../../common/utils/itwMocksUtils.ts";
import {
  ItwCredentialStatus,
  StoredCredential
} from "../../../common/utils/itwTypesUtils.ts";

type Props = {
  credential: StoredCredential;
  isL3Credential: boolean;
};

const validStates: Array<ItwCredentialStatus | undefined> = [
  "valid",
  "expiring",
  "jwtExpiring"
];

/**
 * Informative alert that is only visible when a credential is in a valid state.
 */
const ItwPresentationCredentialInfoAlert = ({
  credential,
  isL3Credential
}: Props) => {
  const { credentialType } = credential;

  const { status } = useIOSelector(state =>
    itwCredentialStatusSelector(state, credential.credentialType)
  );

  if (!validStates.includes(status)) {
    return null;
  }

  if (credentialType === CredentialType.DRIVING_LICENSE) {
    return (
      <Alert
        testID="itwMdlBannerTestID"
        content={
          isL3Credential
            ? I18n.t("features.itWallet.presentation.alerts.mdl.contentL3")
            : I18n.t("features.itWallet.presentation.alerts.mdl.content")
        }
        variant="info"
      />
    );
  }

  if (credentialType === CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD) {
    return (
      <Alert
        testID="itwEhcBannerTestID"
        content={I18n.t("features.itWallet.presentation.alerts.ehc.content")}
        variant="info"
      />
    );
  }

  return null;
};

const Memoized = memo(ItwPresentationCredentialInfoAlert);

export { Memoized as ItwPresentationCredentialInfoAlert };
