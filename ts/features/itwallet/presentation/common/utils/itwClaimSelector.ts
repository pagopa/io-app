import I18n from "i18next";
import { ClaimsSelector, ListItemInfo } from "@pagopa/io-app-design-system";
import { ComponentProps } from "react";
import { getNestedItemSummary } from "../../../common/components/ItwCredentialMultiClaim";
import {
  ClaimDisplayFormat,
  getClaimDisplayValue,
  getSafeText,
  drivingPrivilegeToClaims
} from "../../../common/utils/itwClaimsUtils";
import { CredentialType } from "../../../common/utils/itwMocksUtils";

/**
 * Defines gradient color schemes for different credential types
 * to be used in the header of the {@link ClaimsSelector} component.
 */
export const claimsSelectorHeaderGradientsByCredentialType: {
  [type: string]: Array<string>;
} = {
  [CredentialType.PID]: ["#ECECEC", "#CEE2F2"],
  [CredentialType.DRIVING_LICENSE]: ["#ECECEC", "#FADCF5"],
  [CredentialType.EUROPEAN_DISABILITY_CARD]: ["#ECECEC", "#E8EEF4"],
  [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: ["#ECECEC", "#ABD8F2"],
  [CredentialType.EDUCATION_DEGREE]: ["#ECECEC", "#F2F1CE"],
  [CredentialType.EDUCATION_ENROLLMENT]: ["#ECECEC", "#E0F2CE"],
  [CredentialType.RESIDENCY]: ["#ECECEC", "#F2E4CE"]
};

type PresentFn = (claims: Array<ClaimDisplayFormat>, title?: string) => void;

/**
 *  Builds the optional endElement action shown at the end of a {@link ClaimsSelector} item.
 * When triggered, it opens the claim details bottom sheet managed by
 * `useClaimsDetailsBottomSheet`.
 * @param present - Function to present the bottom sheet with claim details.
 * @param claims - Array of claims to display in the bottom sheet.
 * @param title - Optional title for the bottom sheet.
 * @return A ListItemInfo endElement configuration or undefined if no present function is provided.
 */
const buildInfoEndElement = (
  present: PresentFn | undefined,
  claims: Array<ClaimDisplayFormat>,
  title?: string
): ListItemInfo["endElement"] => {
  if (!present) {
    return undefined;
  }

  return {
    type: "iconButton",
    componentProps: {
      icon: "info",
      accessibilityLabel: title ?? I18n.t("global.buttons.show"),
      onPress: () => present(claims, title)
    }
  };
};

/**
 * Maps a list of claims into {@link ClaimsSelector} items, handling the different
 * display formats supported by the component.
 * @param claims - Array of claims to be mapped.
 * @param present - Optional function used to present claim details
 * in a bottom sheet.
 * @returns An array of items formatted for the {@link ClaimsSelector} component.
 */
export const mapClaimsToClaimsSelectorItems = (
  claims: Array<ClaimDisplayFormat>,
  present?: PresentFn
): ComponentProps<typeof ClaimsSelector>["items"] =>
  claims.flatMap(c => {
    const { renderAs, value } = getClaimDisplayValue(c);
    const description = c.label;
    const id = c.id;

    switch (renderAs) {
      case "image":
        return [{ id, value, description, type: "image" }];

      case "drivingPrivileges":
        return value.map((p, idx) => ({
          id: `${idx}_${description}_${p.driving_privilege}`,
          description,
          value: p.driving_privilege,
          endElement: buildInfoEndElement(
            present,
            drivingPrivilegeToClaims(p),
            I18n.t(
              "features.itWallet.verifiableCredentials.claims.mdl.category",
              {
                category: p.driving_privilege
              }
            )
          )
        }));

      case "nestedObject":
        return mapClaimsToClaimsSelectorItems(value);

      case "nestedObjectArray": {
        const nestedClaimItems = value;

        if (nestedClaimItems.length === 1) {
          return mapClaimsToClaimsSelectorItems(nestedClaimItems[0]);
        }

        return nestedClaimItems.map((singleItemClaims, index) => {
          const { summaryLabel, summaryValue } = getNestedItemSummary(
            id,
            singleItemClaims
          );

          const itemId = `${index}_${id}_${description}`;
          // For education degrees and education enrollments credentials, summaryLabel and summaryValue are mandatory.
          const summaryDesc = getSafeText(summaryLabel ?? "");
          const summaryVal = getSafeText(summaryValue ?? "");

          return {
            id: itemId,
            description: summaryDesc,
            value: summaryVal,
            endElement: buildInfoEndElement(present, singleItemClaims)
          };
        });
      }

      case "list":
        return [
          {
            id,
            description,
            value: value.map(getSafeText).join(", ")
          }
        ];

      case "text":
      default:
        return [{ id, value: getSafeText(value), description }];
    }
  });
