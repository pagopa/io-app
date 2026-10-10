import { render } from "@testing-library/react-native";

import { ItwStoredCredentialsMocks } from "../../../utils/itwMocksUtils";
import { CardData } from "../CardData";

jest.mock("@shopify/react-native-skia", () => ({
  Skia: {
    Data: {
      fromBase64: jest.fn()
    },
    Image: {
      MakeImageFromEncoded: jest.fn()
    }
  },
  Canvas: jest.fn()
}));

describe("CardData", () => {
  const accompanyingPersonScenarios = [
    { name: "entitled holder", value: true, expectedMark: true },
    { name: "holder without entitlement", value: false, expectedMark: false },
    {
      name: "hidden entitlement",
      value: true,
      valuesHidden: true,
      expectedMark: false
    },
    { name: "missing entitlement", value: undefined, expectedMark: false },
    { name: "invalid entitlement", value: "true", expectedMark: false },
    { name: "card back", value: true, side: "back", expectedMark: false }
  ] as const;

  test.each(accompanyingPersonScenarios)(
    "shows the accompanying person mark for $name",
    scenario => {
      const credential = ItwStoredCredentialsMocks.dc;
      const component = render(
        <CardData
          credential={{
            ...credential,
            parsedCredential: {
              ...credential.parsedCredential,
              constant_attendance_allowance: {
                ...credential.parsedCredential.constant_attendance_allowance,
                value: scenario.value
              }
            }
          }}
          side={"side" in scenario ? scenario.side : "front"}
          valuesHidden={"valuesHidden" in scenario && scenario.valuesHidden}
        />
      );
      expect(
        component.queryByText("A", {
          includeHiddenElements: true
        }) !== null
      ).toBe(scenario.expectedMark);
    }
  );

  it("should match snapshot for MDL front data", () => {
    const component = render(
      <CardData
        credential={ItwStoredCredentialsMocks.mdl}
        side="front"
        valuesHidden={false}
      />
    );

    expect(component.queryByTestId("mdlFrontDataTestID")).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  it("should match snapshot for MDL back data", () => {
    const component = render(
      <CardData
        credential={ItwStoredCredentialsMocks.mdl}
        side="back"
        valuesHidden={false}
      />
    );

    expect(component.queryByTestId("mdlBackDataTestID")).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  it("should match snapshot for DC front data", () => {
    const component = render(
      <CardData
        credential={ItwStoredCredentialsMocks.dc}
        side="front"
        valuesHidden={false}
      />
    );

    expect(component.queryByTestId("dcFrontDataTestID")).toBeTruthy();
    expect(component).toMatchSnapshot();
  });

  it("should match snapshot for DC back data", () => {
    const component = render(
      <CardData
        credential={ItwStoredCredentialsMocks.dc}
        side="back"
        valuesHidden={false}
      />
    );

    expect(component.queryByTestId("dcBackDataTestID")).toBeTruthy();
    expect(component.getByLabelText("QR Code")).toBeTruthy();
    expect(component).toMatchSnapshot();
  });
});
