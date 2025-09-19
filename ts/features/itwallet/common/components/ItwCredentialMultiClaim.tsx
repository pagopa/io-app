import { Fragment } from "react";
import { Divider } from "@pagopa/io-app-design-system";
import { ClaimDisplayFormat } from "../utils/itwClaimsUtils.ts";
import { ItwCredentialStatus } from "../utils/itwTypesUtils.ts";
import { HIDDEN_CLAIM_TEXT } from "../utils/constants.ts";
import { ItwNestedClaimsListItem } from "./ItwNestedClaimsListItem.tsx";
import { ItwCredentialClaim } from "./ItwCredentialClaim.tsx";

interface ItwCredentialMultiClaimProps {
  nestedClaims: Array<Array<ClaimDisplayFormat>>;
  claim: ClaimDisplayFormat;
  hidden?: boolean;
  isPreview?: boolean;
  credentialStatus?: ItwCredentialStatus;
  credentialType?: string;
}

/**
 * Type for the configuration of nested credential summaries.
 */
type NestedCredentialSummaryConfig = {
  summaryLabelId: string;
  summaryValueId: string;
};

/**
 * Map of nested credential summary configurations.
 * This is used to define how to summarize nested credentials in the UI.
 * Each key is the type of the nested credential, and the value is an object
 * containing the IDs of the label and value to be displayed in the summary.
 * Map more types here as needed.
 */
const itwNestedCredentialSummaryMap: Record<
  string,
  NestedCredentialSummaryConfig
> = {
  education_degrees: {
    summaryLabelId: "programme_type_name",
    summaryValueId: "degree_course_name"
  },
  education_enrollments: {
    summaryLabelId: "programme_type_name",
    summaryValueId: "degree_course_name"
  }
};

/**
 * Given a set of claims for a single nested item and its parent's claim ID,
 * this function looks up the correct configuration and returns the
 * appropriate summary fields. If no configuration is found, it falls back
 * to searching for claims with the IDs "label" and "value".
 *
 * @param claimId The ID of the parent claim (e.g., "education_degrees").
 * @param singleItemClaims The array of claims for the one nested item.
 * @returns An object with the summaryLabel and summaryValue.
 */
const getNestedItemSummary = (
  claimId: string,
  singleItemClaims: Array<ClaimDisplayFormat>
): { summaryLabel?: string; summaryValue?: string } => {
  const summaryConfig = itwNestedCredentialSummaryMap[claimId];

  if (summaryConfig) {
    // custom configuration
    const claimsMap = new Map<string, string>(
      singleItemClaims.map(claim => [claim.id, claim.value as string])
    );
    const summaryLabel = claimsMap.get(summaryConfig.summaryLabelId);
    const summaryValue = claimsMap.get(summaryConfig.summaryValueId);
    return { summaryLabel, summaryValue };
  } else {
    // fallback: use the label and value from the first claim in the array.
    if (singleItemClaims.length > 0) {
      const firstClaim = singleItemClaims[0];
      return {
        summaryLabel: firstClaim.label,
        summaryValue: firstClaim.value as string
      };
    }
    return {};
  }
};

/**
 * Component to render multiple claims that are nested within a parent claim.
 * @param nestedClaims An array of arrays, where each inner array contains claims for a single nested item.
 * @param claim The parent claim that contains the nested claims.
 * @param hidden Indicates if the claim values should be hidden.
 * @param isPreview Indicates if the claims are being rendered in preview mode.
 * @param credentialType Indicates the type of the credential
 * @param credentialStatus Indicates the status of the credential
 */
export const ItwCredentialMultiClaim = ({
  nestedClaims,
  claim,
  hidden,
  isPreview,
  credentialType,
  credentialStatus
}: ItwCredentialMultiClaimProps) => {
  // We render the nested claims as a list if there are multiple items
  const shouldRenderAsList = nestedClaims.length > 1;
  if (shouldRenderAsList) {
    return (
      <>
        {nestedClaims.map((singleItemClaims, index) => {
          const { summaryLabel, summaryValue } = getNestedItemSummary(
            claim.id,
            singleItemClaims
          );

          const displaySummaryValue = hidden ? HIDDEN_CLAIM_TEXT : summaryValue;

          return (
            <Fragment key={`${index}_${claim.id}_${claim.label}`}>
              {index > 0 && <Divider />}
              <ItwNestedClaimsListItem
                itemTitle={displaySummaryValue}
                itemClaims={singleItemClaims}
                summaryLabel={summaryLabel}
                summaryValue={displaySummaryValue}
                hidden={hidden}
                isPreview={isPreview}
                credentialStatus={credentialStatus}
                credentialType={credentialType}
              />
            </Fragment>
          );
        })}
      </>
    );
  } else {
    const singleItemClaims = nestedClaims[0];
    return (
      <>
        {singleItemClaims.map((nestedClaim, index) => (
          <Fragment key={`${index}_${nestedClaim.id}_${nestedClaim.label}`}>
            {index > 0 && <Divider />}
            <ItwCredentialClaim
              key={nestedClaim.id}
              claim={nestedClaim}
              hidden={hidden}
              isPreview={isPreview}
              credentialStatus={credentialStatus}
              credentialType={credentialType}
            />
          </Fragment>
        ))}
      </>
    );
  }
};
