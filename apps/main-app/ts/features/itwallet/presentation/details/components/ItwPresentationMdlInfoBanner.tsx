import { Banner } from "@io-app/design-system";
import I18n from "i18next";
import { memo } from "react";

import { useIODispatch, useIOSelector } from "../../../../../store/hooks.ts";
import { itwCloseBanner } from "../../../common/store/actions/banners";
import { itwIsMdlDetailsInfoBannerHiddenSelector } from "../../../common/store/selectors/banners";
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
 * Informational banner that is only visible when the MDL credential is in a valid state
 * and has not been dismissed by the user.
 */
const ItwPresentationMdlInfoBanner = ({ credential }: Props) => {
  const dispatch = useIODispatch();
  const { status } = useIOSelector(state =>
    itwCredentialStatusSelector(state, credential.credentialType)
  );
  const withL3Design = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const isBannerHidden = useIOSelector(itwIsMdlDetailsInfoBannerHiddenSelector);

  if (
    credential.credentialType !== CredentialType.DRIVING_LICENSE ||
    !validStates.includes(status) ||
    isBannerHidden
  ) {
    return null;
  }

  const handleOnClose = () => {
    dispatch(itwCloseBanner("mdlDetailsInfo"));
  };

  return (
    <Banner
      color="neutral"
      content={
        withL3Design
          ? I18n.t("features.itWallet.presentation.alerts.mdl.contentL3")
          : I18n.t("features.itWallet.presentation.alerts.mdl.content")
      }
      labelClose={I18n.t("global.buttons.close")}
      onClose={handleOnClose}
      pictogramName="premiumCredentials"
      testID="itwMdlBannerTestID"
      title={I18n.t("features.itWallet.presentation.alerts.mdl.bannerTitle")}
    />
  );
};

const Memoized = memo(ItwPresentationMdlInfoBanner);

export { Memoized as ItwPresentationMdlInfoBanner };
