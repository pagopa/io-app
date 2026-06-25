import { Divider, ListItemInfo } from "@pagopa/io-app-design-system";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import I18n from "i18next";
import { Fragment, useMemo } from "react";
import { Image } from "react-native";

import { useIOSelector } from "../../../../store/hooks";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { trackCopyListItem } from "../../analytics";
import { getMixPanelCredential } from "../../analytics/utils/index.ts";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import { HIDDEN_CLAIM_TEXT } from "../utils/constants.ts";
import {
  BoolClaim,
  ClaimDisplayFormat,
  ClaimValue,
  DrivingPrivilegeClaimType,
  DrivingPrivilegesClaim,
  DrivingPrivilegesCustomClaim,
  EmptyStringClaim,
  extractFiscalCode,
  FiscalCodeClaim,
  getSafeText,
  ImageClaim,
  isExpirationDateClaim,
  NestedArrayClaim,
  NestedObjectClaim,
  parseClaims,
  PdfClaim,
  PlaceOfBirthClaim,
  PlaceOfBirthClaimType,
  SimpleDate,
  SimpleDateClaim,
  SimpleListClaim,
  StringClaim
} from "../utils/itwClaimsUtils";
import { ItwCredentialStatus } from "../utils/itwTypesUtils";
import { ItwCredentialMultiClaim } from "./ItwCredentialMultiClaim.tsx";

/**
 * Helper function to get the accessibility text for hidden claims.
 * @returns the localized accessibility text for hidden claims
 */
const getHiddenClaimAccessibilityText = () =>
  I18n.t("features.itWallet.presentation.credentialDetails.hiddenClaim");

/**
 * Component which renders a place of birth type claim.
 * @param label - the label of the claim
 * @param claim - the claim value
 * @param hidden - a flag to hide the claim value
 */
const PlaceOfBirthClaimItem = ({
  label,
  claim,
  hidden
}: {
  claim: PlaceOfBirthClaimType;
  hidden?: boolean;
  label: string;
}) => {
  const realValue = `${claim.locality} (${claim.country})`;
  const displayValue = hidden ? HIDDEN_CLAIM_TEXT : realValue;
  const accessibilityStateText = hidden
    ? getHiddenClaimAccessibilityText()
    : realValue;

  return (
    <ListItemInfo
      accessibilityLabel={`${label} ${accessibilityStateText}`}
      label={label}
      value={displayValue}
    />
  );
};

/**
 * Component which renders a yes/no claim.
 * @param label - the label of the claim
 * @param claim - the claim value
 * @param hidden - a flag to hide the claim value
 */
const BoolClaimItem = ({
  label,
  claim,
  hidden
}: {
  claim: boolean;
  hidden?: boolean;
  label: string;
}) => {
  const realValue = I18n.t(
    `features.itWallet.presentation.credentialDetails.boolClaim.${claim}`
  );
  const displayValue = hidden ? HIDDEN_CLAIM_TEXT : realValue;
  const accessibilityStateText = hidden
    ? getHiddenClaimAccessibilityText()
    : realValue;

  return (
    <ListItemInfo
      accessibilityLabel={`${label}: ${accessibilityStateText}`}
      label={label}
      value={displayValue}
    />
  );
};

/**
 * Component which renders a generic text type claim.
 * @param label - the label of the claim
 * @param claim - the claim value
 * @param isCopyable - a flag to enable the copy of the claim value
 * @param credentialType - the type of the credential, used for analytics tracking
 * @param hidden - a flag to hide the claim value
 */
const PlainTextClaimItem = ({
  label,
  claim,
  isCopyable,
  credentialType,
  hidden
}: {
  claim: string;
  credentialType?: string;
  hidden?: boolean;
  isCopyable?: boolean;
  label: string;
}) => {
  const safeValue = getSafeText(claim);
  const isItwL3 = useIOSelector(itwLifecycleIsITWalletValidSelector);
  const displayValue = hidden ? HIDDEN_CLAIM_TEXT : safeValue;
  const accessibilityStateText = hidden
    ? getHiddenClaimAccessibilityText()
    : safeValue;

  const handleLongPress = () => {
    clipboardSetStringWithFeedback(safeValue);
    if (credentialType) {
      trackCopyListItem({
        credential: getMixPanelCredential(credentialType, isItwL3),
        item_copied: label
      });
    }
  };

  return (
    <ListItemInfo
      accessibilityLabel={`${label} ${accessibilityStateText}`}
      label={label}
      numberOfLines={4}
      onLongPress={isCopyable && !hidden ? handleLongPress : undefined}
      value={displayValue}
    />
  );
};

/**
 * Component which renders a date type claim with an optional icon and expiration badge.
 * @param label - the label of the claim
 * @param claim - the value of the claim
 * @param status - the status of the claim, used to show an expiration badge
 * @param hidden - a flag to hide the claim value
 */
const DateClaimItem = ({
  label,
  claim,
  status,
  hidden
}: {
  claim: SimpleDate;
  hidden?: boolean;
  label: string;
  status?: ItwCredentialStatus;
}) => {
  // Remove the timezone offset to display the date in its original format
  const realValue = claim.toString("DD/MM/YYYY");
  const displayValue = hidden ? HIDDEN_CLAIM_TEXT : realValue;
  const accessibilityStateText = hidden
    ? getHiddenClaimAccessibilityText()
    : realValue;

  const endElement: ListItemInfo["endElement"] = useMemo(() => {
    if (hidden) {
      return undefined;
    }
    const ns = "features.itWallet.presentation.credentialDetails.status";
    switch (status) {
      case "expired":
        return {
          type: "badge",
          componentProps: { variant: "error", text: I18n.t(`${ns}.expired`) }
        };
      case "expiring":
      case "jwtExpiring":
      case "valid":
        return {
          type: "badge",
          componentProps: { variant: "success", text: I18n.t(`${ns}.valid`) }
        };
      case "invalid":
        return {
          type: "badge",
          componentProps: { variant: "error", text: I18n.t(`${ns}.invalid`) }
        };
      default:
        return undefined;
    }
  }, [status, hidden]);

  return (
    <ListItemInfo
      accessibilityLabel={`${label} ${accessibilityStateText}`}
      endElement={endElement}
      key={`${label}-${displayValue}`}
      label={label}
      value={displayValue}
    />
  );
};

/**
 * Component which renders a claim of unknown type with a placeholder.
 * @param label - the label of the claim
 * @param _claim - the claim value of unknown type. We are not interested in its value but it's needed for the exaustive type checking.
 */
const UnknownClaimItem = ({ label }: { _claim?: unknown; label: string }) => (
  <PlainTextClaimItem
    claim={I18n.t("features.itWallet.generic.placeholders.claimNotAvailable")}
    label={label}
  />
);

/**
 * Component which renders a image type claim in a square container.
 * @param label - the label of the claim
 * @param claim - the claim value
 * @param hidden - a flag to hide the claim value
 */
const ImageClaimItem = ({
  label,
  claim,
  hidden
}: {
  claim: string;
  hidden?: boolean;
  label: string;
}) =>
  hidden ? (
    <PlainTextClaimItem claim="" hidden label={label} />
  ) : (
    <ListItemInfo
      accessibilityLabel={label}
      accessibilityRole="image"
      label={label}
      value={
        <Image
          accessibilityIgnoresInvertColors
          resizeMode="contain"
          source={{ uri: claim }}
          style={{
            width: 200,
            aspectRatio: 3 / 4
          }}
        />
      }
    />
  );

/**
 * Component which renders an attachment claim
 * @param name - name of the file
 * @param hidden - a flag to hide the claim value
 */
const AttachmentsClaimItem = ({
  name,
  hidden
}: {
  hidden?: boolean;
  name: string;
}) =>
  hidden ? (
    <PlainTextClaimItem
      claim=""
      hidden
      label={I18n.t(
        "features.itWallet.verifiableCredentials.claims.attachments"
      )}
    />
  ) : (
    <ListItemInfo
      accessibilityLabel={`${I18n.t(
        "features.itWallet.verifiableCredentials.claims.attachments"
      )}: ${name}`}
      endElement={{
        type: "badge",
        componentProps: {
          variant: "default",
          text: "PDF"
        }
      }}
      label={I18n.t(
        "features.itWallet.verifiableCredentials.claims.attachments"
      )}
      value={name}
    />
  );

/**
 * Component which renders a driving privileges type claim.
 * It features a bottom sheet with information about the issued and expiration date of the claim.
 * @param label the label of the claim
 * @param claim the claim value
 * @param detailsButtonVisible a flag to show or hide the details button
 * @param hidden a flag to hide the claim value
 * @returns a list item component with the driving privileges claim
 */
const DrivingPrivilegesClaimItem = ({
  label,
  claim,
  detailsButtonVisible,
  hidden
}: {
  claim: DrivingPrivilegeClaimType;
  detailsButtonVisible?: boolean;
  hidden?: boolean;
  label: string;
}) => {
  const localExpiryDate = claim.expiry_date.toString("DD/MM/YYYY");
  const localIssueDate = claim.issue_date.toString("DD/MM/YYYY");
  const privilegeBottomSheet = useIOBottomSheetModal({
    title: I18n.t(
      "features.itWallet.verifiableCredentials.claims.mdl.category",
      { category: claim.driving_privilege }
    ),
    component: (
      <>
        <ListItemInfo
          accessibilityLabel={`${I18n.t(
            "features.itWallet.verifiableCredentials.claims.mdl.issuedDate"
          )} ${localIssueDate}`}
          label={I18n.t(
            "features.itWallet.verifiableCredentials.claims.mdl.issuedDate"
          )}
          value={localIssueDate}
        />
        <Divider />
        <ListItemInfo
          accessibilityLabel={`${I18n.t(
            "features.itWallet.verifiableCredentials.claims.mdl.expirationDate"
          )} ${localExpiryDate}`}
          label={I18n.t(
            "features.itWallet.verifiableCredentials.claims.mdl.expirationDate"
          )}
          value={localExpiryDate}
        />
        {claim.restrictions_conditions && (
          <>
            <Divider />
            <ListItemInfo
              accessibilityLabel={`${I18n.t(
                "features.itWallet.verifiableCredentials.claims.mdl.restrictionConditions"
              )} ${claim.restrictions_conditions}`}
              label={I18n.t(
                "features.itWallet.verifiableCredentials.claims.mdl.restrictionConditions"
              )}
              value={claim.restrictions_conditions}
            />
          </>
        )}
      </>
    )
  });

  const realValue = claim.driving_privilege;
  const displayValue = hidden ? HIDDEN_CLAIM_TEXT : realValue;
  const accessibilityStateText = hidden
    ? getHiddenClaimAccessibilityText()
    : realValue;

  const endElement: ListItemInfo["endElement"] =
    detailsButtonVisible && !hidden
      ? {
          type: "buttonLink",
          componentProps: {
            label: I18n.t("global.buttons.show"),
            onPress: () => privilegeBottomSheet.present(),
            accessibilityLabel: I18n.t("global.buttons.show")
          }
        }
      : undefined;

  return (
    <>
      <ListItemInfo
        accessibilityLabel={`${label} ${accessibilityStateText}`}
        endElement={endElement}
        label={label}
        value={displayValue}
      />
      {privilegeBottomSheet.bottomSheet}
    </>
  );
};

/**
 * Component which renders a claim.
 * It renders a different component based on the type of the claim.
 * @param claim - the claim to render
 * @param hidden - a flag to hide the claim value
 * @param isPreview - a flag to indicate if the claim is being rendered in preview mode
 * @param credentialStatus - the status of the credential, used for expiration date claims
 * @param credentialType - the type of the credential, used for analytics tracking
 */
export const ItwCredentialClaim = ({
  claim,
  hidden,
  isPreview,
  credentialStatus,
  credentialType
}: {
  claim: ClaimDisplayFormat;
  credentialStatus?: ItwCredentialStatus;
  credentialType?: string;
  hidden?: boolean;
  isPreview?: boolean;
}) =>
  pipe(
    claim.value,
    ClaimValue.decode,
    E.fold(
      () => <UnknownClaimItem label={claim.label} />,

      decoded => {
        if (PlaceOfBirthClaim.is(decoded)) {
          return (
            <PlaceOfBirthClaimItem
              claim={decoded}
              hidden={hidden}
              label={claim.label}
            />
          );
        }
        if (SimpleDateClaim.is(decoded)) {
          return (
            <DateClaimItem
              claim={decoded}
              hidden={hidden}
              label={claim.label}
              status={
                !isPreview && isExpirationDateClaim(claim)
                  ? credentialStatus
                  : undefined
              }
            />
          );
        }
        if (ImageClaim.is(decoded)) {
          return (
            <ImageClaimItem
              claim={decoded}
              hidden={hidden}
              label={claim.label}
            />
          );
        }
        if (PdfClaim.is(decoded)) {
          return <AttachmentsClaimItem hidden={hidden} name={claim.label} />;
        }
        if (
          DrivingPrivilegesClaim.is(decoded) ||
          DrivingPrivilegesCustomClaim.is(decoded)
        ) {
          return decoded.map((elem, index) => (
            <Fragment key={`${index}_${claim.label}_${elem.driving_privilege}`}>
              {index !== 0 && <Divider />}
              <DrivingPrivilegesClaimItem
                claim={elem}
                detailsButtonVisible={!isPreview}
                hidden={hidden}
                label={claim.label}
              />
            </Fragment>
          ));
        }
        if (FiscalCodeClaim.is(decoded)) {
          const fiscalCode = pipe(
            decoded,
            extractFiscalCode,
            O.getOrElseW(() => decoded)
          );
          return (
            <PlainTextClaimItem
              claim={fiscalCode}
              hidden={hidden}
              label={claim.label}
            />
          );
        }
        if (NestedObjectClaim.is(decoded)) {
          const nestedClaims = parseClaims(decoded);
          return (
            <>
              {nestedClaims.map((nestedClaim, index) => (
                <Fragment key={`${index}_${claim.id}_${nestedClaim.id}`}>
                  {index > 0 && <Divider />}
                  <ItwCredentialClaim
                    claim={nestedClaim}
                    credentialStatus={credentialStatus}
                    credentialType={credentialType}
                    hidden={hidden}
                    isPreview={isPreview}
                  />
                </Fragment>
              ))}
            </>
          );
        }
        if (NestedArrayClaim.is(decoded)) {
          const nestedParsedClaims = decoded.map(item => parseClaims(item));
          return (
            <ItwCredentialMultiClaim
              claim={claim}
              credentialStatus={credentialStatus}
              credentialType={credentialType}
              hidden={hidden}
              isPreview={isPreview}
              nestedClaims={nestedParsedClaims}
            />
          );
        }
        if (BoolClaim.is(decoded)) {
          return (
            <BoolClaimItem
              claim={decoded}
              hidden={hidden}
              label={claim.label}
            />
          );
        }
        if (SimpleListClaim.is(decoded)) {
          return (
            <PlainTextClaimItem
              claim={decoded.join(", ")}
              hidden={hidden}
              label={claim.label}
            />
          );
        }
        if (EmptyStringClaim.is(decoded)) {
          return null; // We want to hide the claim if it's empty
        }
        if (StringClaim.is(decoded)) {
          // This is needed because otherwise empty string will be rendered as a claim due to the decoded value being HIDDEN_CLAIM_TEXT
          if (hidden && EmptyStringClaim.is(decoded)) {
            return null;
          }
          return (
            <PlainTextClaimItem
              claim={decoded}
              credentialType={credentialType}
              hidden={hidden}
              isCopyable={!isPreview}
              label={claim.label}
            />
          ); // must be the last one to be checked due to overlap with IPatternStringTag
        }

        return <UnknownClaimItem _claim={decoded} label={claim.label} />;
      }
    )
  );
