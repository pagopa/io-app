/**
 * Generic utilities for organizations
 */
import { contentRepoUrl } from "../config";

export function getLogoForOrganization(
  orgFiscalCode: string,
  logosRepoUrl: string = `${contentRepoUrl}/logos`
) {
  return orgFiscalCode.replace(/^0+/, "")
    ? [`organizations/${orgFiscalCode.replace(/^0+/, "")}`].map(u => ({
        uri: `${logosRepoUrl}/${u}.png`
      }))
    : undefined;
}
