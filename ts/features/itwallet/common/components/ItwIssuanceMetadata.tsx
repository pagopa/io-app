import { Divider, ListItemInfo } from "@pagopa/io-app-design-system";
import { useMemo } from "react";
import I18n from "i18next";
import { useItwInfoBottomSheet } from "../hooks/useItwInfoBottomSheet";
import { StoredCredential } from "../utils/itwTypesUtils";
import {
  getMixPanelCredential,
  trackWalletCredentialShowAuthSource,
  trackWalletCredentialShowIssuer
} from "../../analytics";
import { ITW_IPZS_PRIVACY_URL_BODY } from "../../../../urls";
import { useIOSelector } from "../../../../store/hooks";
import { generateDynamicUrlSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { getAuthSource, getItwAuthSource } from "../utils/itwMetadataUtils.ts";
import { isItwCredential } from "../utils/itwCredentialUtils.ts";
import { CredentialType } from "../utils/itwMocksUtils";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import { itwCredentialsCatalogueByTypesSelector } from "../../credentialsCatalogue/store/selectors/index.ts";
import { DigitalCredentialMetadata } from "../utils/itwCredentialsCatalogueUtils.ts";

type ItwIssuanceMetadataProps = {
  credential: StoredCredential;
  isPreview?: boolean;
};

type ItwMetadataIssuanceListItemProps = {
  label: string;
  value: string;
  bottomSheet: {
    contentTitle: string;
    contentBody: string;
    onPress: () => void;
  };
  isPreview?: boolean;
};

const ItwMetadataIssuanceListItem = ({
  label,
  value,
  bottomSheet: bottomSheetProps,
  isPreview
}: ItwMetadataIssuanceListItemProps) => {
  const bottomSheet = useItwInfoBottomSheet({
    title: value,
    content: [
      {
        title: bottomSheetProps.contentTitle,
        body: bottomSheetProps.contentBody
      }
    ]
  });

  const endElement: ListItemInfo["endElement"] = useMemo(() => {
    if (isPreview) {
      return;
    }

    return {
      type: "iconButton",
      componentProps: {
        icon: "info",
        accessibilityLabel: `Info ${label}`,
        onPress: () => {
          bottomSheetProps.onPress();
          bottomSheet.present();
        }
      }
    };
  }, [isPreview, bottomSheet, bottomSheetProps, label]);

  return (
    <>
      <ListItemInfo
        endElement={endElement}
        label={label}
        value={value}
        accessibilityLabel={`${label} ${value}`}
      />
      {bottomSheet.bottomSheet}
    </>
  );
};

/**
 * Renders additional issuance-related metadata, i.e. releaser and auth source.
 * They are not part of the claims list, thus they're rendered separately.
 * @param credential - the credential with the issuer configuration
 * @param isPreview - whether the component is rendered in preview mode which hides the info button.
 * @returns the list items with the metadata.
 */
export const ItwIssuanceMetadata = ({
  credential,
  isPreview
}: ItwIssuanceMetadataProps) => {
  const releaserName =
    credential.issuerConf.federation_entity.organization_name;
  const itwCredential = isItwCredential(credential);
  const privacyUrl = useIOSelector(state =>
    generateDynamicUrlSelector(state, "io_showcase", ITW_IPZS_PRIVACY_URL_BODY)
  );
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const mixPanelCredential = getMixPanelCredential(
    credential.credentialType,
    isItwL3
  );

  const credentialsFromCatalogue = useIOSelector(
    itwCredentialsCatalogueByTypesSelector
  );

  const authSource =
    itwCredential && credentialsFromCatalogue
      ? getItwAuthSource(credentialsFromCatalogue[credential.credentialType])
      : getAuthSource(credential);

  const releasedByKey =
    itwCredential && credential.credentialType === CredentialType.PID
      ? "releasedByPid"
      : "releasedBy";

  const releaserNameBottomSheet: ItwMetadataIssuanceListItemProps["bottomSheet"] =
    useMemo(
      () => ({
        contentTitle: I18n.t(
          "features.itWallet.issuance.credentialPreview.bottomSheet.about.title"
        ),
        contentBody: I18n.t(
          "features.itWallet.issuance.credentialPreview.bottomSheet.about.subtitle",
          {
            privacyUrl
          }
        ),
        onPress: () =>
          trackWalletCredentialShowIssuer({
            credential: mixPanelCredential,
            credential_screen_type: isPreview ? "preview" : "detail"
          })
      }),
      [isPreview, mixPanelCredential, privacyUrl]
    );

  const authSourceBottomSheet: ItwMetadataIssuanceListItemProps["bottomSheet"] =
    useMemo(
      () => ({
        contentTitle: I18n.t(
          "features.itWallet.issuance.credentialPreview.bottomSheet.authSource.title"
        ),
        contentBody: I18n.t(
          "features.itWallet.issuance.credentialPreview.bottomSheet.authSource.subtitle"
        ),
        onPress: () =>
          trackWalletCredentialShowAuthSource({
            credential: mixPanelCredential,
            credential_screen_type: isPreview ? "preview" : "detail"
          })
      }),
      [isPreview, mixPanelCredential]
    );

  return (
    <>
      {authSource && (
        <ItwMetadataIssuanceListItem
          label={I18n.t(
            "features.itWallet.verifiableCredentials.claims.authenticSource"
          )}
          value={authSource}
          isPreview={isPreview}
          bottomSheet={authSourceBottomSheet}
        />
      )}
      {authSource && releaserName && <Divider />}
      {releaserName && (
        <ItwMetadataIssuanceListItem
          label={I18n.t(
            `features.itWallet.verifiableCredentials.claims.${releasedByKey}`
          )}
          value={releaserName}
          isPreview={isPreview}
          bottomSheet={releaserNameBottomSheet}
        />
      )}
    </>
  );
};
