import React from "react";
import { OrganizationFiscalCode } from "italia-ts-commons/lib/strings";

import { isAndroid, isIos } from "../../../utils/platform";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { ItemAction } from "../../../utils/url";
import SectionHeader from ".././SectionHeader";
import LinkRow from ".././LinkRow";

import { ServicePublicService_metadata } from "../../../../definitions/backend/ServicePublic";
import InformationRow from "./InformationRow";

type Props = {
  getItemOnPress: (value: string, valueType?: ItemAction) => () => void;
  isDebugModeEnabled: boolean;
  organizationFiscalCode: OrganizationFiscalCode;
  serviceId: ServiceId;
  servicesMetadata?: ServicePublicService_metadata;
};

/**
 * Renders a dedicated section with a service's metadata and the header.
 */
const ServiceMetadata: React.FC<Props> = ({
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
          hint={"clipboard.copyText"}
        />
      }
      {address && (
        <InformationRow
          value={address}
          label={"services.contactAddress"}
          onPress={getItemOnPress(address, "MAP")}
          hint={"openMaps.openAddressOnMap"}
        />
      )}
      {phone && (
        <InformationRow
          value={phone}
          label={"global.media.phone"}
          onPress={getItemOnPress(`tel:${phone}`)}
          hint={"messageDetails.call"}
        />
      )}
      {email && (
        <InformationRow
          value={email}
          label={"global.media.email"}
          onPress={getItemOnPress(`mailto:${email}`)}
          hint={"messageDetails.sendEmail"}
        />
      )}
      {pec && (
        <InformationRow
          value={pec}
          label={"global.media.pec"}
          onPress={getItemOnPress(`mailto:${pec}`)}
          hint={"messageDetails.sendEmail"}
        />
      )}
      {isDebugModeEnabled && serviceId && (
        <InformationRow
          value={serviceId}
          label={"global.id"}
          onPress={getItemOnPress(serviceId, "COPY")}
          hint={"clipboard.copyText"}
        />
      )}
    </>
  );
};

export default ServiceMetadata;
