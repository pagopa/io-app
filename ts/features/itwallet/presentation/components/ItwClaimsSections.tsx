import React from "react";
import { VSpacer } from "@pagopa/io-app-design-system";
import { pipe, constNull } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import I18n from "../../../../i18n";
import { groupCredentialClaims } from "../../common/utils/itwClaimsUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { ItwCredentialClaimsSection } from "../../common/components/ItwCredentialClaimsSection";
import { ItwCredentialClaim } from "../../common/components/ItwCredentialClaim";

type Props = {
  credential: StoredCredential;
};

/**
 * Renders claims within sections defined by the hardcoded configuration in app.
 */
export const ItwClaimsSections = ({ credential }: Props) => {
  const groupedClaims = groupCredentialClaims(credential);

  return (
    <>
      {pipe(
        groupedClaims.personalData,
        O.fromNullable,
        O.filter(RA.isNonEmpty),
        O.fold(constNull, claims => (
          <>
            <VSpacer size={24} />
            <ItwCredentialClaimsSection
              title={I18n.t("features.itWallet.presentation.personalDataTitle")}
              canHideValues
              claims={claims}
            />
          </>
        ))
      )}
      {/* TODO: add section for mDL */}
      {pipe(
        groupedClaims.documentData,
        O.fromNullable,
        O.filter(RA.isNonEmpty),
        O.fold(constNull, claims => (
          <>
            <VSpacer size={24} />
            <ItwCredentialClaimsSection
              title={I18n.t("features.itWallet.presentation.documentDataTitle")}
              claims={claims}
            />
          </>
        ))
      )}
      {/* Fallback for claims that could not be assigned to any section */}
      {pipe(
        groupedClaims.noSection,
        O.fromNullable,
        O.filter(RA.isNonEmpty),
        O.fold(constNull, claims => (
          <>
            <VSpacer size={24} />
            {claims.map(c => (
              <ItwCredentialClaim key={c.id} claim={c} />
            ))}
          </>
        ))
      )}
    </>
  );
};
