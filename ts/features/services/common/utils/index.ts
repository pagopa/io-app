import { contentRepoUrl } from "../../../../config";

export function getLogoForInstitution(
  institutionId: string,
  logosRepoUrl: string = `${contentRepoUrl}/logos`
) {
  return [`organizations/${institutionId.replace(/^0+/, "")}`].map(u => ({
    uri: `${logosRepoUrl}/${u}.png`
  }));
}
