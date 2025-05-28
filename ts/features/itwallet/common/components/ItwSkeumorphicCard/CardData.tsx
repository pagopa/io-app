/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/dot-notation */
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ElementType, Fragment, memo } from "react";
import { StyleSheet, View } from "react-native";
import { QrCodeImage } from "../../../../../components/QrCodeImage";
import {
  DrivingPrivilegesClaim,
  StringClaim
} from "../../utils/itwClaimsUtils";
import { ParsedCredential, StoredCredential } from "../../utils/itwTypesUtils";
import { CardClaim, CardClaimContainer, CardClaimRenderer } from "./CardClaim";
import { ClaimLabel } from "./ClaimLabel";
import { CardSide } from "./types";

type DataComponentProps = {
  claims: ParsedCredential;
  valuesHidden: boolean;
};

const MdlFrontData = ({ claims, valuesHidden }: DataComponentProps) => {
  const row = 11.6; // Row padding, defines the first row position
  const rowStep = 6.9; // Row step, defines the space between each row
  const rows: ReadonlyArray<number> = Array.from(
    { length: 6 },
    (_, i) => row + rowStep * i
  );
  const cols: ReadonlyArray<number> = [34, 57.5];

  return (
    <View testID="mdlFrontDataTestID" style={styles.container}>
      <CardClaim
        claim={claims["portrait"]}
        position={{ left: "4%", top: "30%" }}
        dimensions={{
          width: "22.5%",
          aspectRatio: 77 / 93 // This aspect ration was extracted from the Figma design
        }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={claims["family_name"]}
        position={{ left: `${cols[0]}%`, top: `${rows[0]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={claims["given_name"]}
        position={{ left: `${cols[0]}%`, top: `${rows[1]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={claims["birth_date"]}
        position={{ left: `${cols[0]}%`, top: `${rows[2]}%` }}
        dateFormat="DD/MM/YY"
        hidden={valuesHidden}
      />
      <CardClaim
        claim={claims["place_of_birth"]}
        position={{ left: `${cols[0] + 17}%`, top: `${rows[2]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={claims["issue_date"]}
        position={{ left: `${cols[0]}%`, top: `${rows[3]}%` }}
        fontWeight={"Bold"}
        dateFormat={"DD/MM/YYYY"}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={claims["issuing_authority"]}
        position={{ left: `${cols[1]}%`, top: `${rows[3]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={claims["expiry_date"]}
        position={{ left: `${cols[0]}%`, top: `${rows[4]}%` }}
        fontWeight={"Bold"}
        dateFormat={"DD/MM/YYYY"}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={claims["document_number"]}
        position={{ left: `${cols[0]}%`, top: `${rows[5]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={claims["driving_privileges"]}
        position={{ left: "8%", bottom: "17.9%" }}
        hidden={valuesHidden}
      />
    </View>
  );
};

const MdlBackData = ({ claims, valuesHidden }: DataComponentProps) => {
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

  const row = 6.8; // Row padding, defines the first row position
  const rowStep = 4.7; // Row step, defines the space between each row
  // This object definies the rows of the driving privileges table, specifing the "y" coordinate for each item
  const privilegesTableRows: Record<string, number> = drivingPrivileges.reduce(
    (acc, privilege, index) => ({
      ...acc,
      [privilege]: row + rowStep * index
    }),
    {} as Record<string, number>
  );

  return (
    <View testID="mdlBackDataTestID" style={styles.container}>
      <CardClaimRenderer
        claim={claims["driving_privileges_details"]}
        is={DrivingPrivilegesClaim.is}
        component={privileges =>
          privileges.map(
            ({
              driving_privilege,
              issue_date,
              expiry_date,
              restrictions_conditions
            }) => (
              <Fragment key={`driving_privilege_row_${driving_privilege}`}>
                <CardClaimContainer
                  position={{
                    left: `41.5%`,
                    top: `${privilegesTableRows[driving_privilege] || 0}%`
                  }}
                >
                  <ClaimLabel fontSize={9} hidden={valuesHidden}>
                    {issue_date.toString("DD/MM/YY")}
                  </ClaimLabel>
                </CardClaimContainer>
                <CardClaimContainer
                  key={`driving_privilege_${driving_privilege}`}
                  position={{
                    left: `55%`,
                    top: `${privilegesTableRows[driving_privilege] || 0}%`
                  }}
                >
                  <ClaimLabel fontSize={9} hidden={valuesHidden}>
                    {expiry_date.toString("DD/MM/YY")}
                  </ClaimLabel>
                </CardClaimContainer>
                {restrictions_conditions && (
                  <CardClaimContainer
                    key={`driving_privilege_restricted_conditions_${driving_privilege}`}
                    position={{
                      left: `68.5%`,
                      top: `${privilegesTableRows[driving_privilege] || 0}%`
                    }}
                  >
                    <ClaimLabel fontSize={9}>
                      {restrictions_conditions}
                    </ClaimLabel>
                  </CardClaimContainer>
                )}
              </Fragment>
            )
          )
        }
      />
      <CardClaim
        claim={claims["restrictions_conditions"]}
        position={{ left: "8%", bottom: "6.5%" }}
        fontSize={9}
        hidden={valuesHidden}
      />
    </View>
  );
};

const DcFrontData = ({ claims, valuesHidden }: DataComponentProps) => {
  const row = 44.5; // Row padding, defines the first row position
  const rowStep = 11.4; // Row step, defines the space between each row

  const rows: ReadonlyArray<number> = Array.from(
    { length: 5 },
    (_, i) => row + rowStep * i
  );

  return (
    <View testID="dcFrontDataTestID" style={styles.container}>
      <CardClaim
        claim={claims["portrait"]}
        position={{ left: "2.55%", bottom: "1.%" }}
        dimensions={{
          width: "24.7%",
          aspectRatio: 73 / 106 // This aspect ration was extracted from the Figma design
        }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={claims["given_name"]}
        position={{ right: "3.5%", top: `${rows[0]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={claims["family_name"]}
        position={{ right: "3.5%", top: `${rows[1]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={claims["birth_date"]}
        position={{ right: "3.5%", top: `${rows[2]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={claims["document_number"]}
        position={{ right: "3.5%", top: `${rows[3]}%` }}
        hidden={valuesHidden}
      />
      <CardClaim
        claim={claims["expiry_date"]}
        position={{ right: "3.5%", top: `${rows[4]}%` }}
        hidden={valuesHidden}
      />
    </View>
  );
};

const DcBackData = ({ claims }: DataComponentProps) => (
  <View testID="dcBackDataTestID" style={styles.container}>
    <CardClaimRenderer
      claim={claims["link_qr_code"]}
      is={StringClaim.is}
      component={qrCode => (
        <CardClaimContainer
          position={{
            right: `6%`,
            top: `10%`
          }}
        >
          <QrCodeImage value={qrCode} size={"28.5%"} />
        </CardClaimContainer>
      )}
    />
  </View>
);

const dataComponentMap: Record<
  string,
  Record<CardSide, ElementType<DataComponentProps>>
> = {
  MDL: { front: MdlFrontData, back: MdlBackData },
  EuropeanDisabilityCard: { front: DcFrontData, back: DcBackData }
};

type CardDataProps = {
  credential: StoredCredential;
  side: CardSide;
  valuesHidden: boolean;
};

const CardData = ({ credential, side, valuesHidden }: CardDataProps) =>
  pipe(
    O.fromNullable(dataComponentMap[credential.credentialType]),
    O.map(components => components[side]),
    O.map(DataComponent => (
      <DataComponent
        key={`credential_data_${credential.credentialType}_${side}`}
        claims={credential.parsedCredential}
        valuesHidden={valuesHidden}
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

const MemoizeCardData = memo(CardData);

export { MemoizeCardData as CardData };
