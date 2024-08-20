/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/dot-notation */
import { HStack } from "@pagopa/io-app-design-system";
import { parse } from "date-fns";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { LayoutRectangle, StyleSheet, View } from "react-native";
import { localeDateFormat } from "../../../../../utils/locale";
import { DrivingPrivilegesClaim } from "../../utils/itwClaimsUtils";
import { ParsedCredential, StoredCredential } from "../../utils/itwTypesUtils";
import {
  AbsoluteClaimPosition,
  CardClaim,
  CardClaimContainer,
  CardClaimRenderer
} from "./CardClaim";
import { ClaimLabel } from "./ClaimLabel";
import { CardSide } from "./types";

type CardDataProps = {
  credential: StoredCredential;
  side: CardSide;
  layout?: LayoutRectangle;
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

type DataComponentProps = {
  claims: ParsedCredential;
};

const MdlFrontData = ({ claims }: DataComponentProps) => (
  <View testID="mdlFrontDataTestID" style={styles.container}>
    <CardClaim claim={claims["portrait"]} position={{ y: "29%", x: "4.2%" }} />
    <CardClaim
      claim={claims["given_name"]}
      position={{ y: "15%", x: "34.75%" }}
    />
    <CardClaim
      claim={claims["family_name"]}
      position={{ y: "22.4%", x: "34.75%" }}
    />
    <CardClaim
      claim={claims["birth_date"]}
      position={{ y: "29.8%", x: "34.75%" }}
    />
    <CardClaim
      claim={claims["place_of_birth"]}
      position={{ y: "29.8%", x: "55%" }}
    />
    <CardClaim
      claim={claims["issue_date"]}
      position={{ y: "37.2%", x: "34.75%" }}
    />
    <CardClaim
      claim={claims["expiry_date"]}
      position={{ y: "44.6%", x: "34.75%" }}
    />
    <CardClaim
      claim={claims["document_number"]}
      position={{ y: "52%", x: "34.75%" }}
    />
    <CardClaim
      claim={claims["driving_privileges_details"]}
      position={{ y: "78.5%", x: "8.85%" }}
    />
  </View>
);

const MdlBackData = ({ claims }: DataComponentProps) => {
  const row = 8.2;
  const rowStep = 5.22;

  const privilegePositions: Record<string, AbsoluteClaimPosition> = {
    ["AM"]: { x: "38%", y: `${row + rowStep * 0}%` },
    ["A1"]: { x: "38%", y: `${row + rowStep * 1}%` },
    ["A2"]: { x: "38%", y: `${row + rowStep * 2}%` },
    ["A"]: { x: "38%", y: `${row + rowStep * 3}%` },
    ["B1"]: { x: "38%", y: `${row + rowStep * 4}%` },
    ["B"]: { x: "38%", y: `${row + rowStep * 5}%` },
    ["C1"]: { x: "38%", y: `${row + rowStep * 6}%` },
    ["C"]: { x: "38%", y: `${row + rowStep * 7}%` },
    ["D1"]: { x: "38%", y: `${row + rowStep * row}%` },
    ["D"]: { x: "38%", y: `${row + rowStep * 9}%` },
    ["BE"]: { x: "38%", y: `${row + rowStep * 10}%` },
    ["C1E"]: { x: "38%", y: `${row + rowStep * 11}%` },
    ["CE"]: { x: "38%", y: `${row + rowStep * 12}%` },
    ["D1E"]: { x: "38%", y: `${row + rowStep * 13}%` },
    ["DE"]: { x: "38%", y: `${row + rowStep * 14}%` }
  };

  return (
    <View testID="mdlBackDataTestID" style={styles.container}>
      <CardClaimRenderer
        claim={claims["driving_privileges_details"]}
        decoder={DrivingPrivilegesClaim}
        component={privileges => (
          <>
            {privileges.map(p => (
              <CardClaimContainer
                key={`driving_privilege_${p.driving_privilege}`}
                position={
                  privilegePositions[p.driving_privilege] || { x: 0, y: 0 }
                }
              >
                <HStack space={12}>
                  <ClaimLabel>
                    {localeDateFormat(parse(p.issue_date), "%d/%m/%y")}
                  </ClaimLabel>
                  <ClaimLabel>
                    {localeDateFormat(parse(p.expiry_date), "%d/%m/%y")}
                  </ClaimLabel>
                </HStack>
              </CardClaimContainer>
            ))}
          </>
        )}
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

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%"
  }
});

export default React.memo(CardData);
