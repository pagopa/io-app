/**
 * Generic utilities for services
 */

import { ImageURISource } from "react-native";

import { ServicePublic } from "../../definitions/backend/ServicePublic";

import { contentRepoUrl } from "../config";

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
    `services/${service.service_id}`,
    `organizations/${service.organization_fiscal_code.replace(/^0+/, "")}`
  ].map(u => ({
    uri: `${logosRepoUrl}/${u}.png`
  }));
}
