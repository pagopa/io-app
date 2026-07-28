import { Alert } from "@io-app/design-system";
import I18n from "i18next";
import { memo } from "react";

import { useIOSelector } from "../../../../../store/hooks.ts";
import { CredentialType } from "../../../common/utils/itwMocksUtils.ts";
import {
  CredentialMetadata,
  ItwCredentialStatus
} from "../../../common/utils/itwTypesUtils.ts";
import { itwCredentialStatusSelector } from "../../../credentials/store/selectors";

type Props = {
  credential: CredentialMetadata;
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

  if (credentialType === CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD) {
    return (
      <Alert
        content={I18n.t("features.itWallet.presentation.alerts.ehc.content")}
        testID="itwEhcBannerTestID"
        variant="info"
      />
    );
  }

  return null;
};

const Memoized = memo(ItwPresentationCredentialInfoAlert);

export { Memoized as ItwPresentationCredentialInfoAlert };
