import { RpEntityConfiguration } from "@pagopa/io-react-native-wallet/lib/typescript/rp/types";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

/**
 * Retrieve the organization name from the rp entity information wrapped in an option.
 * @param rpEntity - the rp entity information object wrapped in an option
 * @returns the organization name or an empty string
 */
export const getRpEntityOrganizationName = (
  rpEntity: O.Option<RpEntityConfiguration>
) =>
  pipe(
    rpEntity,
    O.fold(
      () => "",
      some => some.payload.metadata.federation_entity.organization_name
    )
  );
