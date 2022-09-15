import React from "react";
import { ServicePublic } from "../../../../definitions/backend/ServicePublic";
import OrganizationHeader from "../../../components/OrganizationHeader";
import { logosForService } from "../../../utils/services";

type Props = Readonly<{ service: ServicePublic }>;

export const PnMessageDetailsHeader = (props: Props) => (
  <OrganizationHeader
    serviceName={props.service.service_name}
    organizationName={props.service.organization_name}
    logoURLs={logosForService(props.service)}
  />
);
