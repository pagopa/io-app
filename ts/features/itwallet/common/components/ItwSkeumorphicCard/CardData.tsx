/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/dot-notation */
import { HStack, WithTestID } from "@pagopa/io-app-design-system";
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
        testID={`credential_data_${credential.credentialType}_${side}_testID`}
        key={`credential_data_${credential.credentialType}_${side}`}
        claims={credential.parsedCredential}
      />
    )),
    O.toNullable
  );

type DataComponentProps = WithTestID<{
  claims: ParsedCredential;
  layout?: LayoutRectangle;
}>;

const MdlFrontData = ({ claims, testID }: DataComponentProps) => (
  <View testID={testID} style={styles.container}>
    <CardClaim claim={claims["portrait"]} position={{ y: 0.28, x: 0.044 }} />
    <CardClaim claim={claims["given_name"]} position={{ y: 0.1, x: 0.35 }} />
    <CardClaim claim={claims["family_name"]} position={{ y: 0.16, x: 0.35 }} />
    <CardClaim claim={claims["birth_date"]} position={{ y: 0.22, x: 0.35 }} />
    <CardClaim
      claim={claims["place_of_birth"]}
      position={{ y: 0.22, x: 0.55 }}
    />
    <CardClaim claim={claims["issue_date"]} position={{ y: 0.28, x: 0.35 }} />
    <CardClaim claim={claims["expiry_date"]} position={{ y: 0.34, x: 0.35 }} />
    <CardClaim
      claim={claims["document_number"]}
      position={{ y: 0.4, x: 0.35 }}
    />
    <CardClaim
      claim={claims["driving_privileges_details"]}
      position={{ y: 0.78, x: 0.1 }}
    />
  </View>
);

const MdlBackData = ({ claims, testID }: DataComponentProps) => {
  const privilegeRowStep = 0.0522;

  const privilegePositions: Record<string, AbsoluteClaimPosition> = {
    ["AM"]: { x: 0.38, y: 0.08 },
    ["A1"]: { x: 0.38, y: 0.08 + privilegeRowStep },
    ["A2"]: { x: 0.38, y: 0.08 + privilegeRowStep * 2 },
    ["A"]: { x: 0.38, y: 0.08 + privilegeRowStep * 3 },
    ["B1"]: { x: 0.38, y: 0.08 + privilegeRowStep * 4 },
    ["B"]: { x: 0.38, y: 0.08 + privilegeRowStep * 5 },
    ["C1"]: { x: 0.38, y: 0.08 + privilegeRowStep * 6 },
    ["C"]: { x: 0.38, y: 0.08 + privilegeRowStep * 7 },
    ["D1"]: { x: 0.38, y: 0.08 + privilegeRowStep * 8 },
    ["D"]: { x: 0.38, y: 0.08 + privilegeRowStep * 9 },
    ["BE"]: { x: 0.38, y: 0.08 + privilegeRowStep * 10 },
    ["C1E"]: { x: 0.38, y: 0.08 + privilegeRowStep * 11 },
    ["CE"]: { x: 0.38, y: 0.08 + privilegeRowStep * 12 },
    ["D1E"]: { x: 0.38, y: 0.08 + privilegeRowStep * 13 },
    ["DE"]: { x: 0.38, y: 0.08 + privilegeRowStep * 14 }
  };

  return (
    <View testID={testID} style={styles.container}>
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
