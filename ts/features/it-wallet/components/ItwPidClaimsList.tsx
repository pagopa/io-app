import React from "react";
import { Linking } from "react-native";
import {
  PID,
  PidWithToken
} from "@pagopa/io-react-native-wallet/lib/typescript/pid/sd-jwt";
import { isDate } from "date-fns";
import { ListItemInfo } from "@pagopa/io-app-design-system";
import { ISSUER_URL, mapAssuranceLevel } from "../utils/mocks";
import I18n from "../../../i18n";
import { localeDateFormat } from "../../../utils/locale";

/**
 * This type is used to extract the claims from the PID type and exclude the placeOfBirth claim since we don't use it.
 */
type ClaimsType = Exclude<keyof PID["claims"], "placeOfBirth">;

/**
 * This type represents the props of the common ClaimsList component without the securityLevel prop.
 */
type ClaimsListCommonProps = {
  decodedPid: PidWithToken;
  claims: Array<ClaimsType>;
  expiryDate?: boolean;
  issuerInfo?: boolean;
};

/**
 * This type represents the props of the ClaimsList component without the securityLevel prop.
 */
type ClaimsListWithoutSecurityLevelProps = ClaimsListCommonProps & {
  securityLevel?: false;
};

/**
 * This type represents the props of the ClaimsList component with the securityLevel prop and the onLinkPress.
 * Used to require the onLinkPress when the securityLevel is true.
 */
type ClaimsListWithSecurityLevelProps = ClaimsListCommonProps & {
  securityLevel: true;
  onLinkPress: () => void;
};

/**
 * ClaimsList component props definition.
 * Contains the claims to be displayed, currenly only PID claims are supported.
 */
type ClaimsListProps =
  | ClaimsListWithoutSecurityLevelProps
  | ClaimsListWithSecurityLevelProps;

/**
 * This component renders the list of claims for a PID credential.
 * It dinamically renders the list of claims passed as claims prop in the order they are passed.
 * It also renders the expiry date, the issuer info and the security level if the props are passed.
 * When the securityLevel prop is passed, the onLinkPress prop is required.
 * @param claims - contains the claim to be displayed.
 * @param decodedPid - contains the decoded PID.
 * @param expiryDate - if true, renders the expiry date.
 * @param issuerInfo - if true, renders the issuer info.
 * @param securityLevel - if true, renders the security level.
 * @param onLinkPress - function to be called when the security level link is pressed, required only if securityLevel is true.
 */
const ItwPidClaimsList = (props: ClaimsListProps) => {
  const RenderClaim = ({ claim }: { claim: ClaimsType }) => {
    const claimValue = props.decodedPid.pid.claims[claim];
    const subTitle = isDate(claimValue)
      ? localeDateFormat(
          new Date(props.decodedPid.pid.expiration),
          I18n.t("global.dateFormats.shortFormat")
        )
      : claimValue;
    const title = I18n.t(
      `features.itWallet.verifiableCredentials.claims.${claim}`
    );
    return <ListItemInfo label={title} value={subTitle} />;
  };

  const RenderExpiryDate = () => {
    const expirationDate = localeDateFormat(
      new Date(props.decodedPid.pid.expiration),
      I18n.t("global.dateFormats.shortFormat")
    );
    return (
      <ListItemInfo
        label={I18n.t(
          "features.itWallet.verifiableCredentials.claims.expirationDate"
        )}
        value={expirationDate}
      />
    );
  };

  const RenderSecurityLevel = ({
    onLinkPress
  }: {
    onLinkPress: () => void;
  }) => (
    <ListItemInfo
      label={I18n.t(
        "features.itWallet.verifiableCredentials.claims.securityLevel"
      )}
      value={mapAssuranceLevel(
        props.decodedPid.pid.verification.assuranceLevel
      )}
      endElement={{
        type: "iconButton",
        componentProps: {
          icon: "info",
          onPress: onLinkPress,
          accessibilityLabel: ""
        }
      }}
    />
  );

  const RenderIssuer = () => (
    <>
      <ListItemInfo
        label={I18n.t(
          "features.itWallet.verifiableCredentials.claims.issuedBy"
        )}
        value={
          props.decodedPid.pid.verification.evidence[0].record.source
            .organization_name
        }
        endElement={{
          type: "iconButton",
          componentProps: {
            icon: "info",
            onPress: () => Linking.openURL(ISSUER_URL),
            accessibilityLabel: ""
          }
        }}
      />
      <ListItemInfo
        label={I18n.t("features.itWallet.verifiableCredentials.claims.info")}
        value={ISSUER_URL}
        endElement={{
          type: "iconButton",
          componentProps: {
            icon: "website",
            onPress: () => Linking.openURL(ISSUER_URL),
            accessibilityLabel: ""
          }
        }}
      />
    </>
  );

  return (
    <>
      {props.claims.map((claim, index) => (
        <RenderClaim claim={claim} key={`${index}_${claim}`} />
      ))}

      {props.expiryDate && <RenderExpiryDate />}
      {props.securityLevel && (
        <RenderSecurityLevel onLinkPress={props.onLinkPress} />
      )}
      {props.issuerInfo && <RenderIssuer />}
    </>
  );
};

export default ItwPidClaimsList;
