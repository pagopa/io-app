import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ElementType, Fragment, memo } from "react";
import { StyleSheet, View } from "react-native";

import { QrCodeImage } from "../../../../../components/QrCodeImage";
import {
  DrivingPrivilegesClaim,
  DrivingPrivilegesClaimType,
  DrivingPrivilegesCustomClaim,
  StringClaim
} from "../../utils/itwClaimsUtils";
import {
  CredentialMetadata,
  ParsedCredential
} from "../../utils/itwTypesUtils";
import { CardClaim, CardClaimContainer, CardClaimRenderer } from "./CardClaim";
import { ClaimLabel } from "./ClaimLabel";
import { CardSide } from "./types";

type DataComponentProps = {
  claims: ParsedCredential;
  valuesHidden: boolean;
};

/**
 * Mapping of new claims to old claims for MDL. Some of them have been renamed
 * between specs 0.7 and 1.0, so this is necessary to ensure backward
 * compatibility.
 */
const mdlClaimsFallback: Record<string, string> = {
  birth_place: "place_of_birth",
  document_iss_authority: "issuing_authority"
};

const MdlFrontData = ({ claims, valuesHidden }: DataComponentProps) => {
  const row = 11.6; // Row padding, defines the first row position
  const rowStep = 6.9; // Row step, defines the space between each row
  const rows: ReadonlyArray<number> = Array.from(
    { length: 6 },
    (_, i) => row + rowStep * i
  );
  const cols: ReadonlyArray<number> = [34, 57.5];
  const getClaim = (claimName: string) =>
    claims[claimName] ?? claims[mdlClaimsFallback[claimName]];

  return (
    <View style={styles.container} testID="mdlFrontDataTestID">
      <CardClaim
        claim={getClaim("portrait")}
        dimensions={{
          width: "22.5%",
          aspectRatio: 77 / 93 // This aspect ration was extracted from the Figma design
        }}
        hidden={valuesHidden}
        position={{ left: "4%", top: "30%" }}
      />
      <CardClaim
        claim={getClaim("family_name")}
        hidden={valuesHidden}
        position={{ left: `${cols[0]}%`, top: `${rows[0]}%` }}
      />
      <CardClaim
        claim={getClaim("given_name")}
        hidden={valuesHidden}
        position={{ left: `${cols[0]}%`, top: `${rows[1]}%` }}
      />
      <CardClaim
        claim={getClaim("birth_date")}
        dateFormat="DD/MM/YY"
        hidden={valuesHidden}
        position={{ left: `${cols[0]}%`, top: `${rows[2]}%` }}
      />
      <CardClaim
        claim={getClaim("birth_place")}
        hidden={valuesHidden}
        position={{ left: `${cols[0] + 17}%`, top: `${rows[2]}%` }}
      />
      <CardClaim
        claim={getClaim("issue_date")}
        dateFormat={"DD/MM/YYYY"}
        fontWeight={"Bold"}
        hidden={valuesHidden}
        position={{ left: `${cols[0]}%`, top: `${rows[3]}%` }}
      />
      <CardClaim
        claim={getClaim("document_iss_authority")}
        hidden={valuesHidden}
        position={{ left: `${cols[1]}%`, top: `${rows[3]}%` }}
      />
      <CardClaim
        claim={getClaim("expiry_date")}
        dateFormat={"DD/MM/YYYY"}
        fontWeight={"Bold"}
        hidden={valuesHidden}
        position={{ left: `${cols[0]}%`, top: `${rows[4]}%` }}
      />
      <CardClaim
        claim={getClaim("document_number")}
        hidden={valuesHidden}
        position={{ left: `${cols[0]}%`, top: `${rows[5]}%` }}
      />
      <CardClaim
        claim={getClaim("driving_privileges")}
        hidden={valuesHidden}
        position={{ left: "8%", bottom: "17.9%" }}
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

  const renderData = (privileges: DrivingPrivilegesClaimType) =>
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
              <ClaimLabel fontSize={9}>{restrictions_conditions}</ClaimLabel>
            </CardClaimContainer>
          )}
        </Fragment>
      )
    );
  return (
    <View style={styles.container} testID="mdlBackDataTestID">
      {/*
      This is the renderer of the new MDL back driving privileges data
       */}
      <CardClaimRenderer
        claim={claims["driving_privileges"]}
        component={renderData}
        is={DrivingPrivilegesCustomClaim.is}
      />
      {/*
      This is the renderer of the old MDL back driving privileges data
      TODO: remove this when the old MDL will not be supported anymore
       */}
      <CardClaimRenderer
        claim={claims["driving_privileges_details"]}
        component={renderData}
        is={DrivingPrivilegesClaim.is}
      />
      <CardClaim
        claim={claims["restrictions_conditions"]}
        fontSize={9}
        hidden={valuesHidden}
        position={{ left: "8%", bottom: "6.5%" }}
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
    <View style={styles.container} testID="dcFrontDataTestID">
      <CardClaim
        claim={claims["portrait"]}
        dimensions={{
          width: "24.7%",
          aspectRatio: 73 / 106 // This aspect ration was extracted from the Figma design
        }}
        hidden={valuesHidden}
        position={{ left: "2.55%", bottom: "1.%" }}
      />
      <CardClaim
        claim={claims["given_name"]}
        hidden={valuesHidden}
        position={{ right: "3.5%", top: `${rows[0]}%` }}
      />
      <CardClaim
        claim={claims["family_name"]}
        hidden={valuesHidden}
        position={{ right: "3.5%", top: `${rows[1]}%` }}
      />
      <CardClaim
        claim={claims["birth_date"]}
        hidden={valuesHidden}
        position={{ right: "3.5%", top: `${rows[2]}%` }}
      />
      <CardClaim
        claim={claims["document_number"]}
        hidden={valuesHidden}
        position={{ right: "3.5%", top: `${rows[3]}%` }}
      />
      <CardClaim
        claim={claims["expiry_date"]}
        hidden={valuesHidden}
        position={{ right: "3.5%", top: `${rows[4]}%` }}
      />
    </View>
  );
};

const DcBackData = ({ claims }: DataComponentProps) => (
  <View style={styles.container} testID="dcBackDataTestID">
    <CardClaimRenderer
      claim={claims["link_qr_code"]}
      component={qrCode => (
        <CardClaimContainer
          position={{
            right: `6%`,
            top: `10%`
          }}
        >
          <QrCodeImage size={"28.5%"} value={qrCode} />
        </CardClaimContainer>
      )}
      is={StringClaim.is}
    />
  </View>
);

const dataComponentMap: Record<
  string,
  Record<CardSide, ElementType<DataComponentProps>>
> = {
  mDL: { front: MdlFrontData, back: MdlBackData },
  EuropeanDisabilityCard: { front: DcFrontData, back: DcBackData }
};

type CardDataProps = {
  credential: CredentialMetadata;
  side: CardSide;
  valuesHidden: boolean;
};

const CardData = ({ credential, side, valuesHidden }: CardDataProps) =>
  pipe(
    O.fromNullable(dataComponentMap[credential.credentialType]),
    O.map(components => components[side]),
    O.map(DataComponent => (
      <DataComponent
        claims={credential.parsedCredential}
        key={`credential_data_${credential.credentialType}_${side}`}
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
