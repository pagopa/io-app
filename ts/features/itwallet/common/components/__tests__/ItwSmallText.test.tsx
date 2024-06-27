import * as React from "react";
import { render } from "@testing-library/react-native";
import { ItwSmallText } from "../ItwSmallText";

describe("ItwSmallText", () => {
  it(`should match snapshot`, () => {
    const component = render(
      <ItwSmallText>
        Per maggiori informazioni, leggi l’[informativa Privacy]() e i [Termini
        e Condizioni d’uso]()
      </ItwSmallText>
    );
    expect(component).toMatchSnapshot();
  });
});
