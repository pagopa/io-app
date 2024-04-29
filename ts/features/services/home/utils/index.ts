import { ImageURISource } from "react-native";
import { Institution } from "../../../../../definitions/services/Institution";
import { contentRepoUrl } from "../../../../config";

export function logoForInstitution(
  institution: Institution,
  logosRepoUrl: string = `${contentRepoUrl}/logos`
): ReadonlyArray<ImageURISource> {
  return [`organizations/${institution.fiscal_code.replace(/^0+/, "")}`].map(
    u => ({
      uri: `${logosRepoUrl}/${u}.png`
    })
  );
}
