import React, { useMemo } from "react";
import { Divider, ListItemInfo } from "@pagopa/io-app-design-system";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import { View, Image } from "react-native";
import { DateFromString } from "@pagopa/ts-commons/lib/dates";
import {
  ClaimDisplayFormat,
  ClaimValue,
  DateClaimConfig,
  DrivingPrivilegesClaim,
  DrivingPrivilegesClaimType,
  EvidenceClaim,
  ImageClaim,
  PlaceOfBirthClaim,
  PlaceOfBirthClaimType,
  PlainTextClaim,
  dateClaimsConfig
} from "../utils/itwClaimsUtils";
import I18n from "../../../../i18n";
import { useItwInfoBottomSheet } from "../hooks/useItwInfoBottomSheet";
import { localeDateFormat } from "../../../../utils/locale";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { getExpireStatus } from "../../../../utils/dates";

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
    <>
      <ListItemInfo label={label} value={value} accessibilityLabel={value} />
      <Divider />
    </>
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
}) => (
  <>
    <ListItemInfo
      label={label}
      value={claim}
      accessibilityLabel={`${label} ${claim}`}
    />
    <Divider />
  </>
);

/**
 * Component which renders a date type claim.
 * @param label - the label of the claim
 * @param claim - the value of the claim
 */
const DateClaimItem = ({
  label,
  claim,
  showIcon,
  showExpirationBadge
}: {
  label: string;
  claim: Date;
} & DateClaimConfig) => {
  const value = localeDateFormat(
    claim,
    I18n.t("global.dateFormats.shortFormat")
  );

  const endElement: ListItemInfo["endElement"] = useMemo(() => {
    if (!showExpirationBadge) {
      return;
    }
    const isExpired = getExpireStatus(claim) === "EXPIRED";
    return {
      type: "badge",
      componentProps: {
        variant: isExpired ? "error" : "success",
        text: I18n.t(
          `features.itWallet.presentation.credentialDetails.status.${
            isExpired ? "expired" : "valid"
          }`
        )
      }
    };
  }, [showExpirationBadge, claim]);

  return (
    <View key={`${label}-${value}`}>
      <ListItemInfo
        label={label}
        value={value}
        icon={showIcon ? "calendar" : undefined}
        accessibilityLabel={`${label} ${value}`}
        endElement={endElement}
      />
      <Divider />
    </View>
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
      },
      {
        title: I18n.t(
          "features.itWallet.issuance.credentialPreview.bottomSheet.data.title"
        ),
        body: I18n.t(
          "features.itWallet.issuance.credentialPreview.bottomSheet.data.subtitle"
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
      <Divider />
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
  <>
    <ListItemInfo
      label={label}
      value={
        <Image
          source={{ uri: claim }}
          style={{
            width: 250,
            height: 250
          }}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      }
      accessibilityLabel={`${label} ${claim}`}
    />
    <Divider />
  </>
);

/**
 * Component which renders a driving privileges type claim.
 * It features a bottom sheet with information about the issued and expiration date of the claim.
 * @param label - the label of the claim
 * @param claim - the claim value
 * @returns
 */
const DrivingPrivilegesClaimItem = ({
  label,
  claim
}: {
  label: string;
  claim: DrivingPrivilegesClaimType;
}) => {
  const privilegeBottomSheet = useIOBottomSheetAutoresizableModal({
    title: I18n.t(
      "features.itWallet.verifiableCredentials.claims.mdl.category",
      { category: claim.vehicle_category_code }
    ),
    component: (
      <>
        <ListItemInfo
          label={I18n.t(
            "features.itWallet.verifiableCredentials.claims.mdl.issuedDate"
          )}
          value={claim.issue_date}
          accessibilityLabel={`${label} ${claim.issue_date}`}
        />
        <Divider />
        <ListItemInfo
          label={I18n.t(
            "features.itWallet.verifiableCredentials.claims.mdl.expirationDate"
          )}
          value={claim.expiry_date}
          accessibilityLabel={`${label} ${claim.expiry_date}`}
        />
      </>
    )
  });
  return (
    <>
      <ListItemInfo
        label={label}
        value={claim.vehicle_category_code}
        endElement={{
          type: "iconButton",
          componentProps: {
            icon: "info",
            accessibilityLabel: "test",
            onPress: () => privilegeBottomSheet.present()
          }
        }}
        accessibilityLabel={`${label} ${claim}`}
      />
      <Divider />
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
  hidden
}: {
  claim: ClaimDisplayFormat;
  hidden?: boolean;
}) =>
  pipe(
    claim.value,
    ClaimValue.decode,
    E.fold(
      () => <UnknownClaimItem label={claim.label} />,
      _decoded => {
        const decoded = hidden ? HIDDEN_CLAIM : _decoded;
        if (PlaceOfBirthClaim.is(decoded)) {
          return <PlaceOfBirthClaimItem label={claim.label} claim={decoded} />;
        } else if (DateFromString.is(decoded)) {
          const dateClaimProps = dateClaimsConfig[claim.id];
          return (
            <DateClaimItem
              label={claim.label}
              claim={decoded}
              {...dateClaimProps}
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
        } else if (DrivingPrivilegesClaim.is(decoded)) {
          return (
            <DrivingPrivilegesClaimItem label={claim.label} claim={decoded} />
          );
        } else if (PlainTextClaim.is(decoded)) {
          return <PlainTextClaimItem label={claim.label} claim={decoded} />; // must be the last one to be checked due to overlap with IPatternStringTag
        } else {
          return <UnknownClaimItem label={claim.label} _claim={decoded} />;
        }
      }
    )
  );
