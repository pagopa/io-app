import { Tuple2 } from "italia-ts-commons/lib/tuples";

import { removeServiceTuples } from "../../../../actions/services";
import servicesByIdReducer from "../servicesById";

const initialState = {
  s1: {},
  s2: {},
  s3: {},
  s4: {},
  s5: {}
};

describe("servicesById", () => {
  it("should handle removeServiceTuples correctly", () => {
    const action = removeServiceTuples([
      Tuple2("s2", "a"),
      Tuple2("s3", "b"),
      // Not existing serviceId
      Tuple2("s6", "b")
    ]);

    const expectedState = {
      s1: {},
      s4: {},
      s5: {}
    };

    const obtainedState = servicesByIdReducer(initialState as any, action);

    expect(obtainedState).toMatchObject(expectedState);
  });
});
