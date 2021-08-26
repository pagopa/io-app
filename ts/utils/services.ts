/**
 * Generic utilities for services
 */

import * as pot from "italia-ts-commons/lib/pot";
import { ImageURISource } from "react-native";
import { ServicePublic } from "../../definitions/backend/ServicePublic";
import { contentRepoUrl } from "../config";
import { VisibleServicesState } from "../store/reducers/entities/services/visibleServices";
import { isTextIncludedCaseInsensitive } from "./strings";

/**
 * Returns an array of ImageURISource pointing to possible logos for the
 * provided service.
 *
 * The returned array is suitable for being used with the MultiImage component.
 * The arrays will have first the service logo, then the organization logo.
 */
export function logosForService(
  service: ServicePublic,
  logosRepoUrl: string = `${contentRepoUrl}/logos`
): ReadonlyArray<ImageURISource> {
  return [
    `services/${service.service_id.toLowerCase()}`,
    `organizations/${service.organization_fiscal_code.replace(/^0+/, "")}`
  ].map(u => ({
    uri: `${logosRepoUrl}/${u}.png`
  }));
}

export function serviceContainsText(
  service: ServicePublic,
  searchText: string
) {
  return (
    isTextIncludedCaseInsensitive(service.department_name, searchText) ||
    isTextIncludedCaseInsensitive(service.organization_name, searchText) ||
    isTextIncludedCaseInsensitive(service.service_name, searchText)
  );
}

// Return true if the given service is available (visible)
export const isVisibleService = (
  visibleServices: VisibleServicesState,
  potService: pot.Pot<ServicePublic, Error>
) => {
  const service = pot.toUndefined(potService);
  return (
    service &&
    pot.getOrElse(
      pot.map(visibleServices, services =>
        services.some(item => service.service_id === item.service_id)
      ),
      false
    )
  );
};
