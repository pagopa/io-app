/**
 * Generic utilities for organizations
 */
import { contentRepoUrl } from "../config";

export function getLogoForOrganization(
  orgFiscalCode: string,
  logosRepoUrl: string = `${contentRepoUrl}/logos`
) {
  return [`organizations/${orgFiscalCode.replace(/^0+/, "")}`].map(u => ({
    uri: `${logosRepoUrl}/${u}.png`
  }));
}
