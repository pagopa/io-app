import { Divider, ListItemInfo } from "@pagopa/io-app-design-system";
import { DateFromString } from "@pagopa/ts-commons/lib/dates";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import React, { useMemo } from "react";
import { Image } from "react-native";
import I18n from "../../../../i18n";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { localeDateFormat } from "../../../../utils/locale";
import { useItwInfoBottomSheet } from "../hooks/useItwInfoBottomSheet";
import {
  BoolClaim,
  ClaimDisplayFormat,
  ClaimValue,
  DrivingPrivilegeClaimType,
  DrivingPrivilegesClaim,
  EmptyStringClaim,
  EvidenceClaim,
  FiscalCodeClaim,
  ImageClaim,
  PdfClaim,
  PlaceOfBirthClaim,
  PlaceOfBirthClaimType,
  StringClaim,
  extractFiscalCode,
  isExpirationDateClaim,
  getSafeText
} from "../utils/itwClaimsUtils";
import { ItwCredentialStatus } from "./ItwCredentialCard";

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
const BoolClaimItem = ({ label, claim }: { label: string; claim: boolean }) => (
  <ListItemInfo
    label={label}
    value={I18n.t(
      `features.itWallet.presentation.credentialDetails.boolClaim.${claim}`
    )}
    accessibilityLabel={I18n.t(
      `features.itWallet.presentation.credentialDetails.boolClaim.${claim}`
    )}
  />
);

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
  claim: Date;
  status?: ItwCredentialStatus;
}) => {
  const value = localeDateFormat(
    claim,
    I18n.t("global.dateFormats.shortFormat")
  );

  const endElement: ListItemInfo["endElement"] = useMemo(() => {
    if (!status || status === "pending") {
      return;
    }

    const credentialStatusProps = {
      expired: {
        badge: "error",
        text: "features.itWallet.presentation.credentialDetails.status.expired"
      },
      expiring: {
        badge: "warning",
        text: "features.itWallet.presentation.credentialDetails.status.expiring"
      },
      valid: {
        badge: "success",
        text: "features.itWallet.presentation.credentialDetails.status.valid"
      }
    } as const;
    const { badge, text } = credentialStatusProps[status];
    return {
      type: "badge",
      componentProps: { variant: badge, text: I18n.t(text) }
    };
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
 * Component which renders a evidence type claim.
 * It features a bottom sheet with information about the issuer of the claim.
 * @param issuerName - the organization name of the issuer of the evidence claim.
 */
const EvidenceClaimItem = ({ issuerName }: { issuerName: string }) => {
  const issuedByBottomSheet = useItwInfoBottomSheet({
    title: issuerName,
    content: [
      {
        title: I18n.t(
          "features.itWallet.issuance.credentialPreview.bottomSheet.about.title"
        ),
        body: I18n.t(
          "features.itWallet.issuance.credentialPreview.bottomSheet.about.subtitle"
        )
      }
    ]
  });
  const label = I18n.t(
    "features.itWallet.verifiableCredentials.claims.issuedByNew"
  );
  return (
    <>
      <ListItemInfo
        endElement={{
          type: "iconButton",
          componentProps: {
            icon: "info",
            accessibilityLabel: "test",
            onPress: () => issuedByBottomSheet.present()
          }
        }}
        label={label}
        value={issuerName}
        accessibilityLabel={`${label} ${issuerName}`}
      />
      {issuedByBottomSheet.bottomSheet}
    </>
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
    accessibilityLabel={`${label} ${claim}`}
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
  const localExpiryDate = localeDateFormat(
    new Date(claim.expiry_date),
    I18n.t("global.dateFormats.shortFormat")
  );
  const localIssueDate = localeDateFormat(
    new Date(claim.issue_date),
    I18n.t("global.dateFormats.shortFormat")
  );
  const privilegeBottomSheet = useIOBottomSheetAutoresizableModal({
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
          accessibilityLabel={`${label} ${localIssueDate}`}
        />
        <Divider />
        <ListItemInfo
          label={I18n.t(
            "features.itWallet.verifiableCredentials.claims.mdl.expirationDate"
          )}
          value={localExpiryDate}
          accessibilityLabel={`${label} ${localExpiryDate}`}
        />
        {claim.restrictions_conditions && (
          <>
            <Divider />
            <ListItemInfo
              label={I18n.t(
                "features.itWallet.verifiableCredentials.claims.mdl.restrictionConditions"
              )}
              value={claim.restrictions_conditions || "-"}
              accessibilityLabel={`${label} ${claim.restrictions_conditions}`}
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
        } else if (DateFromString.is(decoded)) {
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
        } else if (EvidenceClaim.is(decoded)) {
          return (
            <EvidenceClaimItem
              issuerName={decoded[0].record.source.organization_name}
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
