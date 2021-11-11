/**
 * Generic utilities for organizations
 */
import { contentRepoUrl } from "../config";

/**
 * This is a partial duplication of ./services/logosForService.
 * TODO: remove it in favour of the generic one
 *
 * @deprecated
 * @param orgFiscalCode
 * @param logosRepoUrl
 */
export function getLogoForOrganization(
  orgFiscalCode: string,
  logosRepoUrl: string = `${contentRepoUrl}/logos`
) {
  return [`organizations/${orgFiscalCode.replace(/^0+/, "")}`].map(u => ({
    uri: `${logosRepoUrl}/${u}.png`
  }));
}
