import { ImageURISource } from "react-native";
import { contentRepoUrl } from "../../../../config";

export function logoForService(
  serviceId: string,
  organizationFiscalCode: string,
  logosRepoUrl: string = `${contentRepoUrl}/logos`
): ReadonlyArray<ImageURISource> {
  return [
    `services/${serviceId.toLowerCase()}`,
    `organizations/${organizationFiscalCode.replace(/^0+/, "")}`
  ].map(u => ({
    uri: `${logosRepoUrl}/${u}.png`
  }));
}
