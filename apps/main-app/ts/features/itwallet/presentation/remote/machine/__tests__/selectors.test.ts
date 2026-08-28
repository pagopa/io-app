import { decode as decodeJwt } from "@pagopa/io-react-native-jwt";
import _ from "lodash";
import { createActor, StateFrom } from "xstate";

import { ItwRemoteMachine, itwRemoteMachine } from "../machine.ts";
import { selectUnverifiedRequestObject } from "../selectors.ts";

jest.mock("@pagopa/io-react-native-jwt", () => ({
  decode: jest.fn()
}));

const mockDecodeJwt = jest.mocked(decodeJwt);

type MachineSnapshot = StateFrom<ItwRemoteMachine>;

const createSnapshot = (requestObjectEncodedJwt?: string): MachineSnapshot => {
  const initialSnapshot = createActor(itwRemoteMachine).getSnapshot();

  return _.merge(undefined, initialSnapshot, {
    context: { requestObjectEncodedJwt }
  } as MachineSnapshot);
};

describe("selectUnverifiedRequestObject", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDecodeJwt.mockImplementation(token => ({
      payload: { state: token },
      protectedHeader: {}
    }));
  });

  it("reuses decoded request object while encoded JWT is unchanged", () => {
    const firstResult = selectUnverifiedRequestObject(
      createSnapshot("encoded-request-object")
    );
    const secondResult = selectUnverifiedRequestObject(
      createSnapshot("encoded-request-object")
    );

    expect(secondResult).toBe(firstResult);
    expect(mockDecodeJwt).toHaveBeenCalledTimes(1);
  });

  it("decodes request object again when encoded JWT changes", () => {
    const firstResult = selectUnverifiedRequestObject(
      createSnapshot("first-request-object")
    );
    const secondResult = selectUnverifiedRequestObject(
      createSnapshot("second-request-object")
    );

    expect(secondResult).not.toBe(firstResult);
    expect(secondResult).toEqual({ state: "second-request-object" });
    expect(mockDecodeJwt).toHaveBeenCalledTimes(2);
  });

  it("does not decode an absent request object", () => {
    expect(selectUnverifiedRequestObject(createSnapshot())).toBeNull();
    expect(mockDecodeJwt).not.toHaveBeenCalled();
  });
});
