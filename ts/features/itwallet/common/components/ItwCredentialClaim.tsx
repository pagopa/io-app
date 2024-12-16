import { Divider, ListItemInfo } from "@pagopa/io-app-design-system";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import React, { useMemo } from "react";
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
  PdfClaim,
  PlaceOfBirthClaim,
  PlaceOfBirthClaimType,
  SimpleDate,
  SimpleDateClaim,
  StringClaim
} from "../utils/itwClaimsUtils";
import { ItwCredentialStatus } from "../utils/itwTypesUtils";

const HIDDEN_CLAIM = "******";

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
 */
const PlainTextClaimItem = ({
  label,
  claim
}: {
  label: string;
  claim: string;
}) => {
  const safeValue = getSafeText(claim);
  return (
    <ListItemInfo
      numberOfLines={2}
      label={label}
      value={safeValue}
      accessibilityLabel={`${label} ${
        claim === HIDDEN_CLAIM
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
 */
export const ItwCredentialClaim = ({
  claim,
  hidden,
  isPreview,
  credentialStatus
}: {
  claim: ClaimDisplayFormat;
  hidden?: boolean;
  isPreview?: boolean;
  credentialStatus?: ItwCredentialStatus;
}) =>
  pipe(
    claim.value,
    ClaimValue.decode,
    E.fold(
      () => <UnknownClaimItem label={claim.label} />,
      // eslint-disable-next-line sonarjs/cognitive-complexity
      _decoded => {
        const decoded = hidden ? HIDDEN_CLAIM : _decoded;
        if (PlaceOfBirthClaim.is(decoded)) {
          return <PlaceOfBirthClaimItem label={claim.label} claim={decoded} />;
        } else if (SimpleDateClaim.is(decoded)) {
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
        } else if (ImageClaim.is(decoded)) {
          return <ImageClaimItem label={claim.label} claim={decoded} />;
        } else if (PdfClaim.is(decoded)) {
          return <AttachmentsClaimItem name={claim.label} />;
        } else if (DrivingPrivilegesClaim.is(decoded)) {
          return decoded.map((elem, index) => (
            <React.Fragment
              key={`${index}_${claim.label}_${elem.driving_privilege}`}
            >
              {index !== 0 && <Divider />}
              <DrivingPrivilegesClaimItem
                label={claim.label}
                claim={elem}
                detailsButtonVisible={!isPreview}
              />
            </React.Fragment>
          ));
        } else if (FiscalCodeClaim.is(decoded)) {
          const fiscalCode = pipe(
            decoded,
            extractFiscalCode,
            O.getOrElseW(() => decoded)
          );
          return <PlainTextClaimItem label={claim.label} claim={fiscalCode} />;
        } else if (BoolClaim.is(decoded)) {
          return <BoolClaimItem label={claim.label} claim={decoded} />; // m
        } else if (EmptyStringClaim.is(decoded)) {
          return null; // We want to hide the claim if it's empty
        }
        if (StringClaim.is(decoded)) {
          // This is needed because otherwise empty string will be rendered as a claim due to the decoded value being HIDDEN_CLAIM
          if (hidden && EmptyStringClaim.is(_decoded)) {
            return null;
          }
          return <PlainTextClaimItem label={claim.label} claim={decoded} />; // must be the last one to be checked due to overlap with IPatternStringTag
        } else {
          return <UnknownClaimItem label={claim.label} _claim={decoded} />;
        }
      }
    )
  );
