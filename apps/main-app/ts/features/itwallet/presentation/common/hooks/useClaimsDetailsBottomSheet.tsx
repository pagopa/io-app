import { Divider } from "@io-app/design-system";
import I18n from "i18next";
import { Fragment, useCallback, useMemo, useState } from "react";
import { View } from "react-native";

import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { ItwCredentialClaim } from "../../../common/components/ItwCredentialClaim";
import { ClaimDisplayFormat } from "../../../common/utils/itwClaimsUtils";

type ClaimsDetails = null | {
  claims: Array<ClaimDisplayFormat>;
  title?: string;
};

/*
 * Hook that manages the presentation of claim details in a bottom sheet.
 * It exposes a `present` function to open the sheet with a given set of claims
 * and handles the internal state and rendering of the sheet content.
 */
export const useClaimsDetailsBottomSheet = () => {
  const [claimsDetails, setClaimsDetails] = useState<ClaimsDetails>(null);

  const component = useMemo(() => {
    if (!claimsDetails) {
      return null;
    }

    const { claims } = claimsDetails;

    return (
      <View>
        {claims.map((claim, index) => (
          <Fragment key={`${claim.id}-${index}`}>
            {index > 0 && <Divider />}
            <ItwCredentialClaim claim={claim} hidden={false} isPreview />
          </Fragment>
        ))}
      </View>
    );
  }, [claimsDetails]);

  const sheet = useIOBottomSheetModal({
    title:
      claimsDetails?.title ??
      I18n.t(
        "features.itWallet.presentation.selectiveDisclosure.bottomsheetTitle"
      ),
    component
  });

  const present = useCallback(
    (claims: Array<ClaimDisplayFormat>, title?: string) => {
      setClaimsDetails({ title, claims });
      sheet.present();
    },
    [sheet]
  );

  return { present, bottomSheet: sheet.bottomSheet };
};
