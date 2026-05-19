import { Alert } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { memo } from "react";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { CredentialType } from "../../../common/utils/itwMocksUtils.ts";
import {
  CredentialMetadata,
  ItwCredentialStatus
} from "../../../common/utils/itwTypesUtils.ts";
import { itwCredentialStatusSelector } from "../../../credentials/store/selectors";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";

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
  const withL3Design = useIOSelector(itwLifecycleIsITWalletValidSelector);

  if (!validStates.includes(status)) {
    return null;
  }

  if (credentialType === CredentialType.DRIVING_LICENSE) {
    return (
      <Alert
        testID="itwMdlBannerTestID"
        content={
          withL3Design
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
