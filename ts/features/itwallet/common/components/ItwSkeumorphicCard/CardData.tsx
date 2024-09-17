/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/dot-notation */
import { parse } from "date-fns";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Fragment, default as React } from "react";
import { StyleSheet, View } from "react-native";
import { localeDateFormat } from "../../../../../utils/locale";
import { DrivingPrivilegesClaim } from "../../utils/itwClaimsUtils";
import { ParsedCredential, StoredCredential } from "../../utils/itwTypesUtils";
import {
  CardClaim,
  CardClaimContainer,
  CardClaimRenderer,
  ClaimPosition
} from "./CardClaim";
import { ClaimLabel } from "./ClaimLabel";
import { CardSide } from "./types";

type DataComponentProps = {
  claims: ParsedCredential;
};

const MdlFrontData = ({ claims }: DataComponentProps) => {
  const row = 11.6; // Row padding, defines the first row position
  const rowStep = 6.9; // Row step, defines the space between each row

  return (
    <View testID="mdlFrontDataTestID" style={styles.container}>
      <CardClaim
        claim={claims["portrait"]}
        position={{ left: "4.20%", top: "30.5%" }}
        dimensions={{
          width: "22%",
          aspectRatio: 77 / 93 // This aspect ration was extracted from the Figma design
        }}
      />
      <CardClaim
        claim={claims["family_name"]}
        position={{ left: "34.6%", top: `${row + rowStep * 0}%` }}
      />
      <CardClaim
        claim={claims["given_name"]}
        position={{ left: "34.6%", top: `${row + rowStep * 1}%` }}
      />
      <CardClaim
        claim={claims["birth_date"]}
        position={{ left: "34.6%", top: `${row + rowStep * 2}%` }}
        dateFormat="%d/%m/%y"
      />
      <CardClaim
        claim={claims["place_of_birth"]}
        position={{ left: "51%", top: `${row + rowStep * 2}%` }}
      />
      <CardClaim
        claim={claims["issue_date"]}
        position={{ left: "34.6%", top: `${row + rowStep * 3}%` }}
        fontWeight={"Bold"}
      />
      <CardClaim
        claim={claims["issuing_authority"]}
        position={{ left: "57.5%", top: `${row + rowStep * 3}%` }}
      />
      <CardClaim
        claim={claims["expiry_date"]}
        position={{ left: "34.6%", top: `${row + rowStep * 4}%` }}
        fontWeight={"Bold"}
      />
      <CardClaim
        claim={claims["document_number"]}
        position={{ left: "34.6%", top: `${row + rowStep * 5}%` }}
      />
      <CardClaim
        claim={claims["driving_privileges_details"]}
        position={{ left: "8.2%", bottom: "17.9%" }}
      />
    </View>
  );
};

const MdlBackData = ({ claims }: DataComponentProps) => {
  // Driving privilges list with the same order as on the Driving License physical card
  const drivingPrivileges = [
    "AM",
    "A1",
    "A2",
    "A",
    "B1",
    "B",
    "C1",
    "C",
    "D1",
    "D",
    "BE",
    "C1E",
    "CE",
    "D1E",
    "DE"
  ] as const;

  // This object definies the rows of the driving privileges table, specifing the "y" coordinate for each item
  const privilegesTableRows: Record<string, ClaimPosition["top"]> =
    drivingPrivileges.reduce(
      (acc, privilege, index) => ({
        ...acc,
        [privilege]: `${
          6.8 + // Row padding, defines the first row position
          4.7 * // Row step, defines the space between each row
            index
        }%`
      }),
      {} as Record<string, ClaimPosition["top"]>
    );

  return (
    <View testID="mdlBackDataTestID" style={styles.container}>
      <CardClaimRenderer
        claim={claims["driving_privileges_details"]}
        is={DrivingPrivilegesClaim.is}
        component={privileges =>
          privileges.map(({ driving_privilege, issue_date, expiry_date }) => (
            <Fragment key={`driving_privilege_row_${driving_privilege}`}>
              <CardClaimContainer
                position={{
                  left: `41.5%`,
                  top: privilegesTableRows[driving_privilege] || `0%`
                }}
              >
                <ClaimLabel fontSize={9}>
                  {localeDateFormat(parse(issue_date), "%d/%m/%y")}
                </ClaimLabel>
              </CardClaimContainer>
              <CardClaimContainer
                key={`driving_privilege_${driving_privilege}`}
                position={{
                  left: `55%`,
                  top: privilegesTableRows[driving_privilege] || `0%`
                }}
              >
                <ClaimLabel fontSize={9}>
                  {localeDateFormat(parse(expiry_date), "%d/%m/%y")}
                </ClaimLabel>
              </CardClaimContainer>
            </Fragment>
          ))
        }
      />
      <CardClaim
        claim={claims["restrictions_conditions"]}
        position={{ left: "8%", bottom: "6.5%" }}
        fontSize={9}
      />
    </View>
  );
};

const dataComponentMap: Record<
  string,
  Record<CardSide, React.ElementType<DataComponentProps>>
> = {
  MDL: { front: MdlFrontData, back: MdlBackData }
};

type CardDataProps = {
  credential: StoredCredential;
  side: CardSide;
};

const CardData = ({ credential, side }: CardDataProps) =>
  pipe(
    O.fromNullable(dataComponentMap[credential.credentialType]),
    O.map(components => components[side]),
    O.map(DataComponent => (
      <DataComponent
        key={`credential_data_${credential.credentialType}_${side}`}
        claims={credential.parsedCredential}
      />
    )),
    O.toNullable
  );

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%"
  }
});

const MemoizeCardData = React.memo(CardData);

export { MemoizeCardData as CardData };
