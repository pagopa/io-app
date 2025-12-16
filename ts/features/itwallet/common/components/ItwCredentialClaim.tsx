import { Divider, ListItemInfo } from "@pagopa/io-app-design-system";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import { Fragment, useMemo } from "react";
import { Image } from "react-native";
import I18n from "i18next";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
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
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { HIDDEN_CLAIM_TEXT } from "../utils/constants.ts";
import { getMixPanelCredential } from "../../analytics/utils/analyticsUtils.ts";
import { useIOSelector } from "../../../../store/hooks";
import { itwLifecycleIsITWalletValidSelector } from "../../lifecycle/store/selectors";
import { ItwCredentialMultiClaim } from "./ItwCredentialMultiClaim.tsx";
import { trackCopyListItem } from "../../analytics";

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
  label: string;
  claim: PlaceOfBirthClaimType;
  hidden?: boolean;
}) => {
  const realValue = `${claim.locality} (${claim.country})`;
  const displayValue = hidden ? HIDDEN_CLAIM_TEXT : realValue;
  const accessibilityStateText = hidden
    ? getHiddenClaimAccessibilityText()
    : realValue;

  return (
    <ListItemInfo
      label={label}
      value={displayValue}
      accessibilityLabel={`${label} ${accessibilityStateText}`}
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
  label: string;
  claim: boolean;
  hidden?: boolean;
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
      label={label}
      value={displayValue}
      accessibilityLabel={`${label}: ${accessibilityStateText}`}
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
  label: string;
  claim: string;
  isCopyable?: boolean;
  credentialType?: string;
  hidden?: boolean;
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
      numberOfLines={4}
      label={label}
      value={displayValue}
      onLongPress={isCopyable && !hidden ? handleLongPress : undefined}
      accessibilityLabel={`${label} ${accessibilityStateText}`}
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
  label: string;
  claim: SimpleDate;
  status?: ItwCredentialStatus;
  hidden?: boolean;
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
      case "valid":
      case "expiring":
      case "jwtExpiring":
        return {
          type: "badge",
          componentProps: { variant: "success", text: I18n.t(`${ns}.valid`) }
        };
      case "expired":
        return {
          type: "badge",
          componentProps: { variant: "error", text: I18n.t(`${ns}.expired`) }
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
      key={`${label}-${displayValue}`}
      label={label}
      value={displayValue}
      accessibilityLabel={`${label} ${accessibilityStateText}`}
      endElement={endElement}
    />
  );
};

/**
 * Component which renders a claim of unknown type with a placeholder.
 * @param label - the label of the claim
 * @param _claim - the claim value of unknown type. We are not interested in its value but it's needed for the exaustive type checking.
 */
const UnknownClaimItem = ({ label }: { label: string; _claim?: unknown }) => (
  <PlainTextClaimItem
    label={label}
    claim={I18n.t("features.itWallet.generic.placeholders.claimNotAvailable")}
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
  label: string;
  claim: string;
  hidden?: boolean;
}) =>
  hidden ? (
    <PlainTextClaimItem label={label} claim="" hidden />
  ) : (
    <ListItemInfo
      label={label}
      value={
        <Image
          source={{ uri: claim }}
          style={{
            width: 200,
            aspectRatio: 3 / 4
          }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      }
      accessibilityLabel={label}
      accessibilityRole="image"
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
  name: string;
  hidden?: boolean;
}) =>
  hidden ? (
    <PlainTextClaimItem
      label={I18n.t(
        "features.itWallet.verifiableCredentials.claims.attachments"
      )}
      claim=""
      hidden
    />
  ) : (
    <ListItemInfo
      label={I18n.t(
        "features.itWallet.verifiableCredentials.claims.attachments"
      )}
      value={name}
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
  label: string;
  claim: DrivingPrivilegeClaimType;
  detailsButtonVisible?: boolean;
  hidden?: boolean;
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
          label={I18n.t(
            "features.itWallet.verifiableCredentials.claims.mdl.issuedDate"
          )}
          value={localIssueDate}
          accessibilityLabel={`${I18n.t(
            "features.itWallet.verifiableCredentials.claims.mdl.issuedDate"
          )} ${localIssueDate}`}
        />
        <Divider />
        <ListItemInfo
          label={I18n.t(
            "features.itWallet.verifiableCredentials.claims.mdl.expirationDate"
          )}
          value={localExpiryDate}
          accessibilityLabel={`${I18n.t(
            "features.itWallet.verifiableCredentials.claims.mdl.expirationDate"
          )} ${localExpiryDate}`}
        />
        {claim.restrictions_conditions && (
          <>
            <Divider />
            <ListItemInfo
              label={I18n.t(
                "features.itWallet.verifiableCredentials.claims.mdl.restrictionConditions"
              )}
              value={claim.restrictions_conditions}
              accessibilityLabel={`${I18n.t(
                "features.itWallet.verifiableCredentials.claims.mdl.restrictionConditions"
              )} ${claim.restrictions_conditions}`}
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
        label={label}
        value={displayValue}
        endElement={endElement}
        accessibilityLabel={`${label} ${accessibilityStateText}`}
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
  hidden?: boolean;
  isPreview?: boolean;
  credentialStatus?: ItwCredentialStatus;
  credentialType?: string;
}) =>
  pipe(
    claim.value,
    ClaimValue.decode,
    E.fold(
      () => <UnknownClaimItem label={claim.label} />,
      // eslint-disable-next-line sonarjs/cognitive-complexity
      decoded => {
        if (PlaceOfBirthClaim.is(decoded)) {
          return (
            <PlaceOfBirthClaimItem
              label={claim.label}
              claim={decoded}
              hidden={hidden}
            />
          );
        }
        if (SimpleDateClaim.is(decoded)) {
          return (
            <DateClaimItem
              label={claim.label}
              claim={decoded}
              hidden={hidden}
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
              label={claim.label}
              claim={decoded}
              hidden={hidden}
            />
          );
        }
        if (PdfClaim.is(decoded)) {
          return <AttachmentsClaimItem name={claim.label} hidden={hidden} />;
        }
        if (
          DrivingPrivilegesClaim.is(decoded) ||
          DrivingPrivilegesCustomClaim.is(decoded)
        ) {
          return decoded.map((elem, index) => (
            <Fragment key={`${index}_${claim.label}_${elem.driving_privilege}`}>
              {index !== 0 && <Divider />}
              <DrivingPrivilegesClaimItem
                label={claim.label}
                claim={elem}
                detailsButtonVisible={!isPreview}
                hidden={hidden}
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
              label={claim.label}
              claim={fiscalCode}
              hidden={hidden}
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
                    hidden={hidden}
                    isPreview={isPreview}
                    credentialStatus={credentialStatus}
                    credentialType={credentialType}
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
              nestedClaims={nestedParsedClaims}
              hidden={hidden}
              isPreview={isPreview}
              credentialStatus={credentialStatus}
              credentialType={credentialType}
            />
          );
        }
        if (BoolClaim.is(decoded)) {
          return (
            <BoolClaimItem
              label={claim.label}
              claim={decoded}
              hidden={hidden}
            />
          );
        }
        if (SimpleListClaim.is(decoded)) {
          return (
            <PlainTextClaimItem
              label={claim.label}
              claim={decoded.join(", ")}
              hidden={hidden}
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
              label={claim.label}
              claim={decoded}
              isCopyable={!isPreview}
              credentialType={credentialType}
              hidden={hidden}
            />
          ); // must be the last one to be checked due to overlap with IPatternStringTag
        }

        return <UnknownClaimItem label={claim.label} _claim={decoded} />;
      }
    )
  );
