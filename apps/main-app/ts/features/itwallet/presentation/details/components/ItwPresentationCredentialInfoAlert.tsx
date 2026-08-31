import { Alert, Banner } from "@io-app/design-system";
import I18n from "i18next";
import { memo } from "react";

import { useIODispatch, useIOSelector } from "../../../../../store/hooks.ts";
import { itwCloseBanner } from "../../../common/store/actions/banners";
import { itwIsMdlDetailsInfoBannerVisibleSelector } from "../../../common/store/selectors/banners";
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

/** Informative alert that is only visible when a credential is in a valid state. */
const ItwPresentationCredentialInfoAlert = ({ credential }: Props) => {
  const dispatch = useIODispatch();
  const { credentialType } = credential;
  const { status } = useIOSelector(state =>
    itwCredentialStatusSelector(state, credential.credentialType)
  );
  const withL3Design = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const isMdlBannerVisible = useIOSelector(
    itwIsMdlDetailsInfoBannerVisibleSelector
  );

  if (!validStates.includes(status)) {
    return null;
  }

  if (credentialType === CredentialType.DRIVING_LICENSE) {
    if (!withL3Design) {
      return (
        <Alert
          content={I18n.t("features.itWallet.presentation.alerts.mdl.content")}
          testID="itwMdlBannerTestID"
          variant="info"
        />
      );
    }
    if (!isMdlBannerVisible) {
      return null;
    }
    return (
      <Banner
        color="neutral"
        content={I18n.t("features.itWallet.presentation.alerts.mdl.contentL3")}
        labelClose={I18n.t("global.buttons.close")}
        onClose={() => dispatch(itwCloseBanner("mdlDetailsInfo"))}
        pictogramName="premiumCredentials"
        testID="itwMdlBannerTestID"
        title={I18n.t("features.itWallet.presentation.alerts.mdl.title")}
      />
    );
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
