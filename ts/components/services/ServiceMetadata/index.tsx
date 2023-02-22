import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import React from "react";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { ServiceMetadata } from "../../../../definitions/backend/ServiceMetadata";
import I18n from "../../../i18n";
import { isTestEnv } from "../../../utils/environment";
import { isAndroid, isIos } from "../../../utils/platform";
import { ItemAction } from "../../../utils/url";
import LinkRow from ".././LinkRow";
import SectionHeader from ".././SectionHeader";
import InformationRow from "./InformationRow";

type Props = {
  getItemOnPress: (value: string, valueType?: ItemAction) => () => void;
  isDebugModeEnabled: boolean;
  organizationFiscalCode: OrganizationFiscalCode;
  serviceId: ServiceId;
  servicesMetadata?: ServiceMetadata;
};

/**
 * Function used to generate the `accessibilityLabel` for a single
 * row in the `ServiceMetadataComponent`. Given the `field`, `value,
 * and `hint` it creates a custom label that contains all these
 * informations.
 */
const genServiceMetadataAccessibilityLabel = (
  field: string,
  value: string,
  hint: string
) => `${field}: ${value}, ${hint}`;

export const testableGenServiceMetadataAccessibilityLabel = isTestEnv
  ? genServiceMetadataAccessibilityLabel
  : undefined;

/**
 * Renders a dedicated section with a service's metadata and the header.
 */
const ServiceMetadataComponent: React.FC<Props> = ({
  organizationFiscalCode,
  getItemOnPress,
  serviceId,
  servicesMetadata,
  isDebugModeEnabled
}: Props) => {
  const {
    address,
    app_android,
    email,
    app_ios,
    pec,
    phone,
    support_url,
    web_url
  } = servicesMetadata || {};
  return (
    <>
      <SectionHeader iconName="io-phone" title={"services.contactsAndInfo"} />

      {/* links */}
      {web_url && <LinkRow text={"services.visitWebsite"} href={web_url} />}
      {support_url && (
        <LinkRow text={"services.askForAssistance"} href={support_url} />
      )}
      {isIos && app_ios && (
        <LinkRow text={"services.otherAppIos"} href={app_ios} />
      )}
      {isAndroid && app_android && (
        <LinkRow text={"services.otherAppAndroid"} href={app_android} />
      )}

      {/* touchable rows */}
      {
        <InformationRow
          value={organizationFiscalCode}
          label={"serviceDetail.fiscalCode"}
          onPress={getItemOnPress(organizationFiscalCode, "COPY")}
          accessibilityLabel={genServiceMetadataAccessibilityLabel(
            I18n.t("serviceDetail.fiscalCodeAccessibility"),
            organizationFiscalCode,
            I18n.t("serviceDetail.fiscalCodeAccessibilityCopy")
          )}
        />
      }
      {address && (
        <InformationRow
          value={address}
          label={"services.contactAddress"}
          onPress={getItemOnPress(address, "MAP")}
          accessibilityLabel={genServiceMetadataAccessibilityLabel(
            I18n.t("services.contactAddress"),
            address,
            I18n.t("openMaps.openAddressOnMap")
          )}
        />
      )}
      {phone && (
        <InformationRow
          value={phone}
          label={"global.media.phone"}
          onPress={getItemOnPress(`tel:${phone}`)}
          accessibilityLabel={genServiceMetadataAccessibilityLabel(
            I18n.t("global.media.phone"),
            phone,
            I18n.t("messageDetails.call")
          )}
        />
      )}
      {email && (
        <InformationRow
          value={email}
          label={"global.media.email"}
          onPress={getItemOnPress(`mailto:${email}`)}
          accessibilityLabel={genServiceMetadataAccessibilityLabel(
            I18n.t("global.media.email"),
            email,
            I18n.t("messageDetails.sendEmail")
          )}
        />
      )}
      {pec && (
        <InformationRow
          value={pec}
          label={"global.media.pec"}
          onPress={getItemOnPress(`mailto:${pec}`)}
          accessibilityLabel={genServiceMetadataAccessibilityLabel(
            I18n.t("global.media.pec"),
            pec,
            I18n.t("messageDetails.sendEmail")
          )}
          isLast
        />
      )}
      {isDebugModeEnabled && serviceId && (
        <InformationRow
          value={serviceId}
          label={"global.id"}
          onPress={getItemOnPress(serviceId, "COPY")}
          accessibilityLabel={genServiceMetadataAccessibilityLabel(
            I18n.t("global.id"),
            serviceId,
            I18n.t("clipboard.copyText")
          )}
        />
      )}
    </>
  );
};

export default ServiceMetadataComponent;
