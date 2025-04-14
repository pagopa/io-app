import { ImageSourcePropType } from "react-native";
import { contentRepoUrl } from "../../../../config";

const LOGO_SIZE = 180;

export function logoForService(
  serviceId: string,
  organizationFiscalCode: string,
  logosRepoUrl: string = `${contentRepoUrl}/logos`
): ImageSourcePropType {
  return [
    `services/${serviceId.toLowerCase()}`,
    `organizations/${organizationFiscalCode.replace(/^0+/, "")}`
  ].map(u => ({
    uri: `${logosRepoUrl}/${u}.png`,
    width: LOGO_SIZE,
    height: LOGO_SIZE
  }));
}
