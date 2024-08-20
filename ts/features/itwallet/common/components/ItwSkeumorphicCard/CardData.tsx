import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { LayoutRectangle } from "react-native";
import { StoredCredential } from "../../utils/itwTypesUtils";
import { dataComponentMap } from "./data";
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

export default React.memo(CardData);
