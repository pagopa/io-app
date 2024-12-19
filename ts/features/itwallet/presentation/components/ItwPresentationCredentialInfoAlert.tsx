import { memo } from "react";
import { Alert } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { itwCredentialStatusSelector } from "../../credentials/store/selectors";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import {
  ItwCredentialStatus,
  StoredCredential
} from "../../common/utils/itwTypesUtils";

type Props = {
  credential: StoredCredential;
};

const validStates: Array<ItwCredentialStatus | undefined> = [
  "valid",
  "expiring",
  "jwtExpiring"
];

/**
 * Informative alert that is only visible when a credential is in a valid state.
 */
const ItwPresentationCredentialInfoAlert = ({ credential }: Props) => {
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
        content={I18n.t("features.itWallet.presentation.alerts.mdl.content")}
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
