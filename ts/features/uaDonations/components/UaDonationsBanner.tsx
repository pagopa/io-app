import { Banner } from "@pagopa/io-app-design-system";
import { useLinkTo } from "@react-navigation/native";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { mixpanelTrack } from "../../../mixpanel";
import { useIOSelector } from "../../../store/hooks";
import { uaDonationsBannerSelector } from "../../../store/reducers/backendStatus";
import { getFullLocale } from "../../../utils/locale";

/**
 * Render a banner using a remote text and a 💙 icon.
 * Tap on this banner generate a navigation to the donation screen.
 * This component is visible only if:
 * local feature flag === true && remote feature flag === true && remote banner visible === true
 * && the locale text is not an empty string
 * @constructor
 */
export const UaDonationsBanner = () => {
  const locale = getFullLocale();
  const uaDonationsBannerData = useIOSelector(state =>
    uaDonationsBannerSelector(state, locale)
  );

  const linkTo = useLinkTo();

  return pipe(
    uaDonationsBannerData,
    O.fold(
      () => null,
      uaDonationsData => (
        <Banner
          pictogramName="charity"
          color="neutral"
          size="big"
          testID={"UaDonationsBanner"}
          content={uaDonationsData.description[locale]}
          /* TODO: Manage this label with proper localization.
          This is the result of the replacement of the legacy banner */
          action="Dona anche tu"
          onPress={() => {
            void mixpanelTrack("UADONATIONS_BANNER_HANDLER_SUCCESS");
            linkTo(`/uadonations-webview?urlToLoad=${uaDonationsData.url}`);
          }}
        />
      )
    )
  );
};
