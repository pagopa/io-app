import { Tuple2 } from "italia-ts-commons/lib/tuples";

import { removeServiceTuples } from "../../../../actions/services";
import { serviceIdsByOrganizationFiscalCodeReducer } from "../servicesByOrganizationFiscalCode";

const initialState = {
  a: ["s1", "s2", "s3"],
  b: ["s4", "s5", "s6", "s7"]
};

describe("servicesByOrganizationFiscalCode", () => {
  it("should handle removeServiceTuples correctly", () => {
    const action = removeServiceTuples([
      Tuple2("s2", "a"),
      Tuple2("s3", "a"),
      Tuple2("s6", "b"),
      // Not existing serviceId
      Tuple2("s8", "b"),
      // Not existing organizationFiscalCode
      Tuple2("s9", "c")
    ]);

    const expectedState = {
      a: ["s1"],
      b: ["s4", "s5", "s7"]
    };

    const obtainedState = serviceIdsByOrganizationFiscalCodeReducer(
      initialState as any,
      action
    );

    expect(obtainedState).toMatchObject(expectedState);
  });
});
