import { ImageURISource } from "react-native";
import { ServicePublic } from "../../../../../definitions/backend/ServicePublic";
import { contentRepoUrl } from "../../../../config";

export function getLogoForInstitution(
  institutionId: string,
  logosRepoUrl: string = `${contentRepoUrl}/logos`
) {
  return [`organizations/${institutionId.replace(/^0+/, "")}`].map(u => ({
    uri: `${logosRepoUrl}/${u}.png`
  }));
}

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
