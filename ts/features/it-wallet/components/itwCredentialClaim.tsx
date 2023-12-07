import React from "react";
import { ListItemInfo } from "@pagopa/io-app-design-system";
import { TextClaim } from "../utils/itwClaims";
import { Claim } from "./ItwCredentialClaimsList";

export default ItwCredentialClaim = ({ claim }: { claim: Claim }) => {
  if (TextClaim.is(claim.value)) {
    return (
      <ListItemInfo
        label={claim.label}
        value={claim.value}
        accessibilityLabel={`${label} ${value}`}
      />
    );
  }else if()
};
