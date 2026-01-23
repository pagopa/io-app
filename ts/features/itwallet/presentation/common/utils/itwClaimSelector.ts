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

const buildInfoEndElement = (
  present: PresentFn | undefined,
  claims: Array<ClaimDisplayFormat>,
  title?: string
): ListItemInfo["endElement"] => {
  if (!present) return undefined;

  return {
    type: "iconButton",
    componentProps: {
      icon: "info",
      accessibilityLabel: title ?? I18n.t("global.buttons.show"),
      onPress: () => present(claims, title)
    }
  };
};

export const mapClaimsToClaimsSelectorItems = (
  claims: Array<ClaimDisplayFormat>,
  present?: PresentFn
): ComponentProps<typeof ClaimsSelector>["items"] =>
  claims.flatMap(c => {
    const display = getClaimDisplayValue(c);
    const description = c.label;
    const id = c.id;

    switch (display.renderAs) {
      case "image":
        return [{ id, value: display.value, description, type: "image" }];

      case "drivingPrivileges":
        return display.value.map((p, idx) => ({
          id: `${id}_${idx}_${p.driving_privilege}`,
          description,
          value: p.driving_privilege,
          endElement: buildInfoEndElement(
            present,
            drivingPrivilegeToClaims(p),
            I18n.t("features.itWallet.verifiableCredentials.claims.mdl.category", {
              category: p.driving_privilege
            })
          )
        }));

      case "nestedObject":
        return mapClaimsToClaimsSelectorItems(display.value);

      case "nestedArrayObject": {
        const nestedClaimItems = display.value;

        if (nestedClaimItems.length === 1) {
          return mapClaimsToClaimsSelectorItems(nestedClaimItems[0]);
        }

        return nestedClaimItems.map((singleItemClaims, index) => {
          const { summaryLabel, summaryValue } = getNestedItemSummary(
            id,
            singleItemClaims
          );

          const itemId = `${id}[${index}]`;
          //TODO: verify fallback
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
            value: display.value.map(getSafeText).join(", ")
          }
        ];

      case "text":
      default:
        return [{ id, value: getSafeText(display.value), description }];
    }
  });
