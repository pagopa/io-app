/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/dot-notation */
import { parse } from "date-fns";
import React, { Fragment } from "react";
import { StyleSheet, View } from "react-native";
import { localeDateFormat } from "../../../../../../utils/locale";
import { DrivingPrivilegesClaim } from "../../../utils/itwClaimsUtils";
import {
  AbsoluteClaimPosition,
  CardClaim,
  CardClaimContainer,
  CardClaimRenderer
} from "./../CardClaim";
import { ClaimLabel } from "./../ClaimLabel";
import { DataComponentProps } from ".";

export const MdlFrontData = ({ claims }: DataComponentProps) => {
  const row = 15;
  const rowStep = 7.3;

  return (
    <View testID="mdlFrontDataTestID" style={styles.container}>
      <CardClaim
        claim={claims["portrait"]}
        position={{ x: "4.2%", y: "29%" }}
      />
      <CardClaim
        claim={claims["given_name"]}
        position={{ x: "34.75%", y: `${row + rowStep * 0}%` }}
      />
      <CardClaim
        claim={claims["family_name"]}
        position={{ x: "34.75%", y: `${row + rowStep * 1}%` }}
      />
      <CardClaim
        claim={claims["birth_date"]}
        position={{ x: "34.75%", y: `${row + rowStep * 2}%` }}
      />
      <CardClaim
        claim={claims["place_of_birth"]}
        position={{ x: "57%", y: `${row + rowStep * 2}%` }}
      />
      <CardClaim
        claim={claims["issue_date"]}
        position={{ x: "34.75%", y: `${row + rowStep * 3}%` }}
      />
      <CardClaim
        claim={claims["expiry_date"]}
        position={{ x: "34.75%", y: `${row + rowStep * 4}%` }}
      />
      <CardClaim
        claim={claims["document_number"]}
        position={{ x: "34.75%", y: `${row + rowStep * 5}%` }}
      />
      <CardClaim
        claim={claims["driving_privileges_details"]}
        position={{ x: "8.85%", y: "78.5%" }}
      />
    </View>
  );
};

export const MdlBackData = ({ claims }: DataComponentProps) => {
  const row = 7.9;
  const rowStep = 5.2;

  const privilegeRows: Record<string, AbsoluteClaimPosition["y"]> = {
    ["AM"]: `${row + rowStep * 0}%`,
    ["A1"]: `${row + rowStep * 1}%`,
    ["A2"]: `${row + rowStep * 2}%`,
    ["A"]: `${row + rowStep * 3}%`,
    ["B1"]: `${row + rowStep * 4}%`,
    ["B"]: `${row + rowStep * 5}%`,
    ["C1"]: `${row + rowStep * 6}%`,
    ["C"]: `${row + rowStep * 7}%`,
    ["D1"]: `${row + rowStep * 8}%`,
    ["D"]: `${row + rowStep * 9}%`,
    ["BE"]: `${row + rowStep * 10}%`,
    ["C1E"]: `${row + rowStep * 11}%`,
    ["CE"]: `${row + rowStep * 12}%`,
    ["D1E"]: `${row + rowStep * 13}%`,
    ["DE"]: `${row + rowStep * 14}%`
  };

  return (
    <View testID="mdlBackDataTestID" style={styles.container}>
      <CardClaimRenderer
        claim={claims["driving_privileges_details"]}
        decoder={DrivingPrivilegesClaim}
        component={privileges =>
          privileges.map(p => (
            <Fragment key={`driving_privilege_${p.driving_privilege}`}>
              <CardClaimContainer
                position={{
                  x: `37%`,
                  y: privilegeRows[p.driving_privilege] || `${row}%`
                }}
              >
                <ClaimLabel>
                  {localeDateFormat(parse(p.issue_date), "%d/%m/%y")}
                </ClaimLabel>
              </CardClaimContainer>
              <CardClaimContainer
                key={`driving_privilege_${p.driving_privilege}`}
                position={{
                  x: `53%`,
                  y: privilegeRows[p.driving_privilege] || `${row}%`
                }}
              >
                <ClaimLabel>
                  {localeDateFormat(parse(p.expiry_date), "%d/%m/%y")}
                </ClaimLabel>
              </CardClaimContainer>
            </Fragment>
          ))
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%"
  }
});
