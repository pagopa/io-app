import { Fragment } from "react";
import { Divider, ListItemInfo } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { ClaimDisplayFormat } from "../utils/itwClaimsUtils";
import { ItwCredentialStatus } from "../utils/itwTypesUtils.ts";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet.tsx";
import { trackItwCredentialQualificationDetail } from "../../analytics";
import { CREDENTIALS_MAP } from "../../analytics/utils/analyticsTypes";
import { getMixPanelCredential } from "../../analytics/utils/analyticsUtils";
import { useIOSelector } from "../../../../store/hooks.ts";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import { ItwCredentialClaim } from "./ItwCredentialClaim.tsx";

type ItwNestedClaimsListItemProps = {
  itemTitle?: string;
  summaryLabel?: string;
  summaryValue?: string;
  itemClaims: Array<ClaimDisplayFormat>;
  hidden?: boolean;
  isPreview?: boolean;
  credentialStatus?: ItwCredentialStatus;
  credentialType?: string;
};

/**
 * Component which renders a list item with nested claims.
 * @param itemTitle - the title of the item
 * @param summaryLabel - the label of the summary item
 * @param summaryValue - the value of the summary item
 * @param itemClaims - the claims to display in the bottom sheet
 * @param hidden - a flag to hide the claim values
 * @param isPreview - a flag to indicate if the claims are being rendered in preview mode
 * @param credentialStatus - the status of the credential, used for expiration date claims
 * @param credentialType - the type of the credential, used for analytics tracking
 * @constructor
 */
export const ItwNestedClaimsListItem = ({
  itemTitle,
  summaryLabel,
  summaryValue,
  itemClaims,
  hidden,
  isPreview,
  credentialStatus,
  credentialType
}: ItwNestedClaimsListItemProps) => {
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const itemBottomSheet = useIOBottomSheetModal({
    title: itemTitle,
    component: (
      <>
        {itemClaims.map((claim, index) => (
          <Fragment key={claim.id}>
            {index > 0 && <Divider />}
            <ItwCredentialClaim
              claim={claim}
              hidden={hidden}
              isPreview={isPreview}
              credentialStatus={credentialStatus}
              credentialType={credentialType}
            />
          </Fragment>
        ))}
      </>
    )
  });

  const onBottomSheetOpen = () => {
    itemBottomSheet.present();
    if (credentialType && CREDENTIALS_MAP[credentialType]) {
      trackItwCredentialQualificationDetail({
        credential: getMixPanelCredential(credentialType, isItwL3),
        credential_screen_type: isPreview ? "preview" : "detail"
      });
    }
  };

  return (
    <>
      <ListItemInfo
        label={summaryLabel}
        value={summaryValue}
        endElement={{
          type: "buttonLink",
          componentProps: {
            label: I18n.t("global.buttons.show"),
            onPress: () => onBottomSheetOpen(),
            accessibilityLabel: I18n.t("global.buttons.show")
          }
        }}
      />
      {itemBottomSheet.bottomSheet}
    </>
  );
};
