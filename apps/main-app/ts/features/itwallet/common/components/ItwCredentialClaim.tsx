import { Divider, ListItemInfo } from "@io-app/design-system";
import I18n from "i18next";
import { Fragment, useMemo } from "react";
import { Image } from "react-native";

import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { HIDDEN_CLAIM_TEXT } from "../utils/constants.ts";
import {
  ClaimDisplayFormat,
  DrivingPrivilegeClaimType,
  extractFiscalCode,
  getSafeText,
  isExpirationDateClaim,
  parseClaims,
  parseClaimValue,
  PlaceOfBirthClaimType,
  SimpleDate
} from "../utils/itwClaimsUtils";
import { ItwCredentialStatus } from "../utils/itwTypesUtils";
import { ItwCredentialMultiClaim } from "./ItwCredentialMultiClaim.tsx";

/**
 * Callback invoked when a claim value is long pressed. It receives the claim
 * label and its displayed (unhidden) value.
 */
export type ItwClaimLongPressHandler = (label: string, value: string) => void;

/**
 * Helper function to get the accessibility text for hidden claims.
 *
 * @returns The localized accessibility text for hidden claims
 */
const getHiddenClaimAccessibilityText = () =>
  I18n.t("features.itWallet.presentation.credentialDetails.hiddenClaim");

/**
 * Component which renders a place of birth type claim.
 *
 * @param label - The label of the claim
 * @param claim - The claim value
 * @param hidden - A flag to hide the claim value
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
 *
 * @param label - The label of the claim
 * @param claim - The claim value
 * @param hidden - A flag to hide the claim value
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
    claim
      ? "features.itWallet.presentation.credentialDetails.boolClaim.true"
      : "features.itWallet.presentation.credentialDetails.boolClaim.false"
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
 *
 * @param label - The label of the claim
 * @param claim - The claim value
 * @param hidden - A flag to hide the claim value. Long press is disabled when
 *   hidden
 * @param onLongPress - Callback invoked when the claim value is long pressed
 */
const PlainTextClaimItem = ({
  label,
  claim,
  hidden,
  onLongPress
}: {
  claim: string;
  hidden?: boolean;
  label: string;
  onLongPress?: ItwClaimLongPressHandler;
}) => {
  const safeValue = getSafeText(claim);
  const displayValue = hidden ? HIDDEN_CLAIM_TEXT : safeValue;
  const accessibilityStateText = hidden
    ? getHiddenClaimAccessibilityText()
    : safeValue;

  return (
    <ListItemInfo
      accessibilityLabel={`${label} ${accessibilityStateText}`}
      label={label}
      numberOfLines={4}
      onLongPress={
        onLongPress && !hidden ? () => onLongPress(label, safeValue) : undefined
      }
      value={displayValue}
    />
  );
};

/**
 * Component which renders a date type claim with an optional icon and
 * expiration badge.
 *
 * @param label - The label of the claim
 * @param claim - The value of the claim
 * @param status - The status of the claim, used to show an expiration badge
 * @param hidden - A flag to hide the claim value. Long press is disabled when
 *   hidden
 * @param onLongPress - Callback invoked when the claim value is long pressed
 */
const DateClaimItem = ({
  label,
  claim,
  status,
  hidden,
  onLongPress
}: {
  claim: SimpleDate;
  hidden?: boolean;
  label: string;
  onLongPress?: ItwClaimLongPressHandler;
  status?: ItwCredentialStatus;
}) => {
  // Remove the timezone offset to display the date in its original format
  const realValue = claim.toString("DD/MM/YYYY");
  const displayValue = hidden ? HIDDEN_CLAIM_TEXT : realValue;
  const accessibilityStateText = hidden
    ? getHiddenClaimAccessibilityText()
    : realValue;

  // Localized description of the claim's validity status. It is used to build the
  // visible badge (when shown) and also to inform screen reader users of the "valid"
  // state, which otherwise has no visible badge.
  const statusText = useMemo(() => {
    switch (status) {
      case "expired":
        return I18n.t(
          "features.itWallet.presentation.credentialDetails.status.expired"
        );
      case "expiring":
      case "jwtExpiring":
      case "valid":
        return I18n.t(
          "features.itWallet.presentation.credentialDetails.status.valid"
        );
      case "invalid":
      case "suspended":
        return I18n.t(
          "features.itWallet.presentation.credentialDetails.status.invalid"
        );
      default:
        return undefined;
    }
  }, [status]);

  const endElement: ListItemInfo["endElement"] = useMemo(() => {
    if (hidden || !statusText) {
      return undefined;
    }
    switch (status) {
      case "expired":
        return {
          type: "badge",
          componentProps: { variant: "error", text: statusText }
        };
      case "expiring":
      case "jwtExpiring":
        return {
          type: "badge",
          componentProps: { variant: "success", text: statusText }
        };
      case "invalid":
        return {
          type: "badge",
          componentProps: { variant: "error", text: statusText }
        };
      // "valid" is the default state, so no badge is shown for it
      case "valid":
      default:
        return undefined;
    }
  }, [status, hidden, statusText]);

  return (
    <ListItemInfo
      accessibilityLabel={
        hidden
          ? `${label} ${accessibilityStateText}`
          : statusText && !endElement
            ? [label, displayValue, statusText].join("; ")
            : undefined
      }
      endElement={endElement}
      key={`${label}-${displayValue}`}
      label={label}
      onLongPress={
        onLongPress && !hidden ? () => onLongPress(label, realValue) : undefined
      }
      value={displayValue}
    />
  );
};

/**
 * Component which renders a claim of unknown type with a placeholder.
 *
 * @param label - The label of the claim
 * @param _claim - The claim value of unknown type. We are not interested in its
 *   value but it's needed for the exaustive type checking.
 */
const UnknownClaimItem = ({ label }: { _claim?: unknown; label: string }) => (
  <PlainTextClaimItem
    claim={I18n.t("features.itWallet.generic.placeholders.claimNotAvailable")}
    label={label}
  />
);

/**
 * Component which renders a image type claim in a square container.
 *
 * @param label - The label of the claim
 * @param claim - The claim value
 * @param hidden - A flag to hide the claim value
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
 *
 * @param name - Name of the file
 * @param hidden - A flag to hide the claim value
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
          text: I18n.t("global.badges.pdf")
        }
      }}
      label={I18n.t(
        "features.itWallet.verifiableCredentials.claims.attachments"
      )}
      value={name}
    />
  );

/**
 * Component which renders a driving privileges type claim. It features a bottom
 * sheet with information about the issued and expiration date of the claim.
 *
 * @param label The label of the claim
 * @param claim The claim value
 * @param detailsButtonVisible A flag to show or hide the details button
 * @param hidden A flag to hide the claim value
 * @returns A list item component with the driving privileges claim
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
 * Component which renders a claim. It renders a different component based on
 * the type of the claim.
 *
 * @param claim - The claim to render
 * @param hidden - A flag to hide the claim value
 * @param isPreview - A flag to indicate if the claim is being rendered in
 *   preview mode
 * @param credentialStatus - The status of the credential, used for expiration
 *   date claims
 * @param credentialType - The type of the credential, forwarded to nested
 *   claims for analytics tracking
 * @param onLongPress - Callback invoked when a text or date claim value is long
 *   pressed. It is never invoked for hidden claims
 */
export const ItwCredentialClaim = ({
  claim,
  hidden,
  isPreview,
  credentialStatus,
  credentialType,
  onLongPress
}: {
  claim: ClaimDisplayFormat;
  credentialStatus?: ItwCredentialStatus;
  credentialType?: string;
  hidden?: boolean;
  isPreview?: boolean;
  onLongPress?: ItwClaimLongPressHandler;
}) =>
  parseClaimValue(claim.value).match(
    parsed => {
      switch (parsed.kind) {
        case "bool":
          return (
            <BoolClaimItem
              claim={parsed.value}
              hidden={hidden}
              label={claim.label}
            />
          );
        case "date":
          return (
            <DateClaimItem
              claim={parsed.value}
              hidden={hidden}
              label={claim.label}
              onLongPress={onLongPress}
              status={
                !isPreview && isExpirationDateClaim(claim)
                  ? credentialStatus
                  : undefined
              }
            />
          );
        case "drivingPrivileges":
          return parsed.value.map((elem, index) => (
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
        // We want to hide the claim if it's empty
        case "emptyString":
          return null;
        case "fiscalCode":
          return (
            <PlainTextClaimItem
              claim={extractFiscalCode(parsed.value) ?? parsed.value}
              hidden={hidden}
              label={claim.label}
              onLongPress={onLongPress}
            />
          );
        case "image":
          return (
            <ImageClaimItem
              claim={parsed.value}
              hidden={hidden}
              label={claim.label}
            />
          );
        case "list":
          return (
            <PlainTextClaimItem
              claim={parsed.value.join(", ")}
              hidden={hidden}
              label={claim.label}
              onLongPress={onLongPress}
            />
          );
        case "nestedArray":
          return (
            <ItwCredentialMultiClaim
              claim={claim}
              credentialStatus={credentialStatus}
              credentialType={credentialType}
              hidden={hidden}
              isPreview={isPreview}
              nestedClaims={parsed.value.map(item => parseClaims(item))}
              onLongPress={onLongPress}
            />
          );
        case "nestedObject":
          return (
            <>
              {parseClaims(parsed.value).map((nestedClaim, index) => (
                <Fragment key={`${index}_${claim.id}_${nestedClaim.id}`}>
                  {index > 0 && <Divider />}
                  <ItwCredentialClaim
                    claim={nestedClaim}
                    credentialStatus={credentialStatus}
                    credentialType={credentialType}
                    hidden={hidden}
                    isPreview={isPreview}
                    onLongPress={onLongPress}
                  />
                </Fragment>
              ))}
            </>
          );
        case "pdf":
          return <AttachmentsClaimItem hidden={hidden} name={claim.label} />;
        case "placeOfBirth":
          return (
            <PlaceOfBirthClaimItem
              claim={parsed.value}
              hidden={hidden}
              label={claim.label}
            />
          );
        case "string":
        case "url":
          return (
            <PlainTextClaimItem
              claim={parsed.value}
              hidden={hidden}
              label={claim.label}
              onLongPress={onLongPress}
            />
          );
      }
    },
    () => <UnknownClaimItem label={claim.label} />
  );
