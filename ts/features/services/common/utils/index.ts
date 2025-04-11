import { ImageURISource } from "react-native";
import { ServiceDetails } from "../../../../../definitions/services/ServiceDetails";
import { contentRepoUrl } from "../../../../config";

const LOGO_SIZE = 180;

export function getLogoForInstitution(
  institutionId: string,
  logosRepoUrl: string = `${contentRepoUrl}/logos`
) {
  return [`organizations/${institutionId.replace(/^0+/, "")}`].map(u => ({
    uri: `${logosRepoUrl}/${u}.png`,
    width: LOGO_SIZE,
    height: LOGO_SIZE
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
  service: ServiceDetails,
  logosRepoUrl: string = `${contentRepoUrl}/logos`
): ReadonlyArray<ImageURISource> {
  return [
    `services/${service.id.toLowerCase()}`,
    `organizations/${service.organization.fiscal_code.replace(/^0+/, "")}`
  ].map(u => ({
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    uri: `${logosRepoUrl}/${u}.png`
  }));
}
