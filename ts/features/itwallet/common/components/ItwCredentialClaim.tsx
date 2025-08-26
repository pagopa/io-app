import { Divider, ListItemInfo } from "@pagopa/io-app-design-system";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import { Fragment, useMemo } from "react";
import { Image } from "react-native";
import I18n from "../../../../i18n";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import {
  BoolClaim,
  ClaimDisplayFormat,
  ClaimValue,
  DrivingPrivilegeClaimType,
  DrivingPrivilegesClaim,
  EmptyStringClaim,
  extractFiscalCode,
  FiscalCodeClaim,
  getSafeText,
  ImageClaim,
  isExpirationDateClaim,
  ParsedNestedClaim,
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
import { CREDENTIALS_MAP, trackCopyListItem } from "../../analytics";
import { ItwNestedClaimsListItem } from "./ItwNestedClaimsListItem.tsx";

/**
 * Type for the configuration of nested credential summaries.
 */
type NestedCredentialSummaryConfig = {
  summaryLabelId: string;
  summaryValueId: string;
};

/**
 * Map of nested credential summary configurations.
 * This is used to define how to summarize nested credentials in the UI.
 * Each key is the type of the nested credential, and the value is an object
 * containing the IDs of the label and value to be displayed in the summary.
 * Map more types here as needed.
 */
const itwNestedCredentialSummaryMap: Record<
  string,
  NestedCredentialSummaryConfig
> = {
  education_degrees: {
    summaryLabelId: "programme_type_name",
    summaryValueId: "degree_course_name"
  },
  education_enrollments: {
    summaryLabelId: "programme_type_name",
    summaryValueId: "degree_course_name"
  }
};

/**
 * Given a set of claims for a single nested item and its parent's claim ID,
 * this function looks up the correct configuration and returns the
 * appropriate summary fields. If no configuration is found, it falls back
 * to searching for claims with the IDs "label" and "value".
 *
 * @param claimId The ID of the parent claim (e.g., "education_degrees").
 * @param singleItemClaims The array of claims for the one nested item.
 * @returns An object with the summaryLabel and summaryValue.
 */
const getNestedItemSummary = (
  claimId: string,
  singleItemClaims: Array<ClaimDisplayFormat>
): { summaryLabel?: string; summaryValue?: string } => {
  const summaryConfig = itwNestedCredentialSummaryMap[claimId];

  if (summaryConfig) {
    // custom configuration
    const claimsMap = new Map<string, string>(
      singleItemClaims.map(claim => [claim.id, claim.value as string])
    );
    const summaryLabel = claimsMap.get(summaryConfig.summaryLabelId);
    const summaryValue = claimsMap.get(summaryConfig.summaryValueId);
    return { summaryLabel, summaryValue };
  } else {
    // fallback: use the label and value from the first claim in the array.
    if (singleItemClaims.length > 0) {
      const firstClaim = singleItemClaims[0];
      return {
        summaryLabel: firstClaim.label,
        summaryValue: firstClaim.value as string
      };
    }
    return {};
  }
};

/**
 * Component which renders a place of birth type claim.
 * @param label - the label of the claim
 * @param claim - the claim value
 */
const PlaceOfBirthClaimItem = ({
  label,
  claim
}: {
  label: string;
  claim: PlaceOfBirthClaimType;
}) => {
  const value = `${claim.locality} (${claim.country})`;
  return (
    <ListItemInfo label={label} value={value} accessibilityLabel={value} />
  );
};

/**
 * Component which renders a yes/no claim.
 * @param label - the label of the claim
 * @param claim - the claim value
 */
const BoolClaimItem = ({ label, claim }: { label: string; claim: boolean }) => {
  const value = I18n.t(
    `features.itWallet.presentation.credentialDetails.boolClaim.${claim}`
  );

  return (
    <ListItemInfo
      label={label}
      value={value}
      accessibilityLabel={`${label}: ${value}`}
    />
  );
};

/**
 * Component which renders a generic text type claim.
 * @param label - the label of the claim
 * @param claim - the claim value
 * @param isCopyable - a flag to enable the copy of the claim value
 */
const PlainTextClaimItem = ({
  label,
  claim,
  isCopyable,
  credentialType
}: {
  label: string;
  claim: string;
  isCopyable?: boolean;
  credentialType?: string;
}) => {
  const safeValue = getSafeText(claim);

  const handleLongPress = () => {
    clipboardSetStringWithFeedback(safeValue);
    if (credentialType) {
      trackCopyListItem({
        credential: CREDENTIALS_MAP[credentialType],
        item_copied: label
      });
    }
  };

  return (
    <ListItemInfo
      numberOfLines={2}
      label={label}
      value={safeValue}
      onLongPress={isCopyable ? handleLongPress : undefined}
      accessibilityLabel={`${label} ${
        claim === HIDDEN_CLAIM_TEXT
          ? I18n.t(
              "features.itWallet.presentation.credentialDetails.hiddenClaim"
            )
          : safeValue
      }`}
    />
  );
};

/**
 * Component which renders a date type claim with an optional icon and expiration badge.
 * @param label - the label of the claim
 * @param claim - the value of the claim
 */
const DateClaimItem = ({
  label,
  claim,
  status
}: {
  label: string;
  claim: SimpleDate;
  status?: ItwCredentialStatus;
}) => {
  // Remove the timezone offset to display the date in its original format

  const value = claim.toString("DD/MM/YYYY");

  const endElement: ListItemInfo["endElement"] = useMemo(() => {
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
  }, [status]);

  return (
    <ListItemInfo
      key={`${label}-${value}`}
      label={label}
      value={value}
      accessibilityLabel={`${label} ${value}`}
      endElement={endElement}
    />
  );
};

/**
 * Component which renders a claim of unknown type with a placeholder.
 * @param label - the label of the claim
 * @param _claim - the claim value of unknown type. We are not interested in its value but it's needed for the exaustive type checking.
 */
const UnknownClaimItem = ({ label }: { label: string; _claim?: never }) => (
  <PlainTextClaimItem
    label={label}
    claim={I18n.t("features.itWallet.generic.placeholders.claimNotAvailable")}
  />
);

/**
 * Component which renders a image type claim in a square container.
 * @param label - the label of the claim
 * @param claim - the claim value
 */
const ImageClaimItem = ({ label, claim }: { label: string; claim: string }) => (
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
 */
const AttachmentsClaimItem = ({ name }: { name: string }) => (
  <ListItemInfo
    label={I18n.t("features.itWallet.verifiableCredentials.claims.attachments")}
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
 * @returns a list item component with the driving privileges claim
 */
const DrivingPrivilegesClaimItem = ({
  label,
  claim,
  detailsButtonVisible
}: {
  label: string;
  claim: DrivingPrivilegeClaimType;
  detailsButtonVisible?: boolean;
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

  const endElement: ListItemInfo["endElement"] = detailsButtonVisible
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
        value={claim.driving_privilege}
        endElement={endElement}
        accessibilityLabel={`${label} ${claim.driving_privilege}`}
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
      _decoded => {
        const decoded = hidden ? HIDDEN_CLAIM_TEXT : _decoded;
        if (PlaceOfBirthClaim.is(decoded)) {
          return <PlaceOfBirthClaimItem label={claim.label} claim={decoded} />;
        }
        if (SimpleDateClaim.is(decoded)) {
          return (
            <DateClaimItem
              label={claim.label}
              claim={decoded}
              status={
                !isPreview && isExpirationDateClaim(claim)
                  ? credentialStatus
                  : undefined
              }
            />
          );
        }
        if (ImageClaim.is(decoded)) {
          return <ImageClaimItem label={claim.label} claim={decoded} />;
        }
        if (PdfClaim.is(decoded)) {
          return <AttachmentsClaimItem name={claim.label} />;
        }
        if (DrivingPrivilegesClaim.is(decoded)) {
          return decoded.map((elem, index) => (
            <Fragment key={`${index}_${claim.label}_${elem.driving_privilege}`}>
              {index !== 0 && <Divider />}
              <DrivingPrivilegesClaimItem
                label={claim.label}
                claim={elem}
                detailsButtonVisible={!isPreview}
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
          return <PlainTextClaimItem label={claim.label} claim={fiscalCode} />;
        }

        if (ParsedNestedClaim.is(decoded)) {
          // If there is exactly ONE nested item, display its claims directly
          if (decoded.length === 1) {
            const singleItemClaims = decoded[0];
            return (
              <>
                {singleItemClaims.map(nestedClaim => (
                  <ItwCredentialClaim
                    key={nestedClaim.id}
                    claim={nestedClaim}
                    hidden={hidden}
                    isPreview={isPreview}
                    credentialStatus={credentialStatus}
                    credentialType={credentialType}
                  />
                ))}
              </>
            );
          }

          // If there are MULTIPLE nested items, render each as a clickable ListItemInfo
          // that opens a bottom sheet with all claims of the item
          if (decoded.length > 1) {
            return (
              <>
                {decoded.map((singleItemClaims, index) => {
                  const { summaryLabel, summaryValue } = getNestedItemSummary(
                    claim.id,
                    singleItemClaims
                  );

                  return (
                    <Fragment key={`${index}_${claim.id}_${claim.label}`}>
                      {index > 0 && <Divider />}
                      <ItwNestedClaimsListItem
                        itemTitle={summaryValue}
                        itemClaims={singleItemClaims}
                        summaryLabel={summaryLabel}
                        summaryValue={summaryValue}
                        hidden={hidden}
                        isPreview={isPreview}
                        credentialStatus={credentialStatus}
                        credentialType={credentialType}
                      />
                    </Fragment>
                  );
                })}
              </>
            );
          }
          return null;
        }
        if (BoolClaim.is(decoded)) {
          return <BoolClaimItem label={claim.label} claim={decoded} />;
        }
        if (SimpleListClaim.is(decoded)) {
          return (
            <PlainTextClaimItem
              label={claim.label}
              claim={decoded.join(", ")}
            />
          );
        }
        if (EmptyStringClaim.is(decoded)) {
          return null; // We want to hide the claim if it's empty
        }
        if (StringClaim.is(decoded)) {
          // This is needed because otherwise empty string will be rendered as a claim due to the decoded value being HIDDEN_CLAIM_TEXT
          if (hidden && EmptyStringClaim.is(_decoded)) {
            return null;
          }
          return (
            <PlainTextClaimItem
              label={claim.label}
              claim={decoded}
              isCopyable={!isPreview}
              credentialType={credentialType}
            />
          ); // must be the last one to be checked due to overlap with IPatternStringTag
        }

        return <UnknownClaimItem label={claim.label} _claim={decoded} />;
      }
    )
  );
