import { StateFrom } from "xstate";

import { EvaluatedDcqlQueryResult } from "../../../common/utils/itwTypesUtils";
import { ItwCredentialIssuanceMachine } from "../machine";
import { selectRequiredClaims } from "../selectors";

type MachineSnapshot = StateFrom<ItwCredentialIssuanceMachine>;

const T_EVALUATED_DCQL_QUERY: EvaluatedDcqlQueryResult = [
  {
    id: "pid",
    format: "dc+sd-jwt",
    keyTag: "pid-key-tag",
    credential: "pid-credential",
    requiredDisclosures: [
      { name: "given_name", value: "John" },
      { name: "family_name", value: "Doe" }
    ],
    presentationFrame: {},
    purposes: [{ required: true }],
    vct: "pid"
  },
  {
    id: "pid-address",
    format: "dc+sd-jwt",
    keyTag: "pid-key-tag",
    credential: "pid-credential",
    requiredDisclosures: [{ name: "resident_address", value: "Main Street" }],
    presentationFrame: {},
    purposes: [{ required: true }],
    vct: "pid"
  }
];

const getSnapshot = (
  evaluatedDcqlQuery?: EvaluatedDcqlQueryResult
): MachineSnapshot =>
  ({
    context: {
      evaluatedDcqlQuery
    }
  }) as MachineSnapshot;

describe("credential machine selectors", () => {
  it("should select required claim names from the evaluated credential request", () => {
    expect(
      selectRequiredClaims(getSnapshot(T_EVALUATED_DCQL_QUERY))
    ).toStrictEqual(["given_name", "family_name", "resident_address"]);
  });

  it("should return undefined when the evaluated credential request is missing", () => {
    expect(selectRequiredClaims(getSnapshot())).toBeUndefined();
  });
});
