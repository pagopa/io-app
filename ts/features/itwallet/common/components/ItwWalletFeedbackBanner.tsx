import { Banner } from "@pagopa/io-app-design-system";
import { constNull } from "fp-ts/lib/function";
import React from "react";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { openWebUrl } from "../../../../utils/url";
import { itwIsWalletEmptySelector } from "../../credentials/store/selectors";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";

const ItwWalletFeebdackBanner = () => {
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);
  const isWalletEmpty = useIOSelector(itwIsWalletEmptySelector);

  if (!isItwValid || isWalletEmpty) {
    // We should display this banner only if the wallet is active and there is at least 1 credential
    return null;
  }

  const handleOnPress = () => {
    openWebUrl("https://pagopa.qualtrics.com/jfe/form/SV_40ije50GQj63CJ0");
  };

  const handleOnClose = constNull;

  return (
    <Banner
      testID="itwWalletReadyBannerTestID"
      title={"Dicci cosa ne pensi"}
      content={
        "Raccontaci la tua esperienza con la funzionalità Documenti su IO."
      }
      action={"Inizia"}
      pictogramName="feedback"
      color="neutral"
      size="big"
      onPress={handleOnPress}
      labelClose={I18n.t("global.buttons.close")}
      onClose={handleOnClose}
    />
  );
};

const MemoizedItwWalletFeebdackBanner = React.memo(ItwWalletFeebdackBanner);

export { MemoizedItwWalletFeebdackBanner as ItwWalletFeebdackBanner };
