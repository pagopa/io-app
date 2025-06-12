import _ from "lodash";
import { SdJwt } from "@pagopa/io-react-native-wallet";
import { itwCredentialsStateMigrations } from "../migrations";

jest.mock("@pagopa/io-react-native-wallet");

describe("ITW credentials reducer migrations", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should migrate from 0 to 1", () => {
    const basePersistedGlobalStateAt0 = {
      eid: { _tag: "Some", value: {} },
      credentials: [
        { _tag: "Some", value: {} },
        { _tag: "Some", value: {} },
        { _tag: "None" }
      ],
      _persist: {
        version: 0,
        rehydrated: false
      }
    };
    const persistedStateAt1 = _.merge(undefined, basePersistedGlobalStateAt0, {
      eid: { _tag: "Some", value: { storedStatusAttestation: undefined } },
      credentials: [
        { _tag: "Some", value: { storedStatusAttestation: undefined } },
        { _tag: "Some", value: { storedStatusAttestation: undefined } },
        { _tag: "None" }
      ]
    });

    const from0To1Migration = itwCredentialsStateMigrations[0];
    expect(from0To1Migration).toBeDefined();
    const nextState = from0To1Migration(basePersistedGlobalStateAt0);

    expect(nextState).toStrictEqual(persistedStateAt1);
  });

  it("should migrate from 1 to 2", () => {
    jest.spyOn(SdJwt, "decode").mockReturnValue({
      disclosures: [{ decoded: ["", "iat", 1718132000] }],
      sdJwt: {
        payload: {
          exp: 1718192000
        }
      }
    } as any);

    const basePersistedGlobalStateAt1 = {
      eid: { _tag: "Some", value: { storedStatusAttestation: undefined } },
      credentials: [
        { _tag: "Some", value: { storedStatusAttestation: undefined } },
        { _tag: "Some", value: { storedStatusAttestation: undefined } },
        { _tag: "None" }
      ],
      _persist: {
        version: 0,
        rehydrated: false
      }
    };
    const persistedStateAt2 = _.merge(undefined, basePersistedGlobalStateAt1, {
      eid: {
        _tag: "Some",
        value: {
          storedStatusAttestation: undefined,
          jwt: {
            expiration: "2024-06-12T11:33:20.000Z",
            issuedAt: "2024-06-11T18:53:20.000Z"
          }
        }
      },
      credentials: [
        {
          _tag: "Some",
          value: {
            storedStatusAttestation: undefined,
            jwt: {
              expiration: "2024-06-12T11:33:20.000Z",
              issuedAt: "2024-06-11T18:53:20.000Z"
            }
          }
        },
        {
          _tag: "Some",
          value: {
            storedStatusAttestation: undefined,
            jwt: {
              expiration: "2024-06-12T11:33:20.000Z",
              issuedAt: "2024-06-11T18:53:20.000Z"
            }
          }
        },
        { _tag: "None" }
      ]
    });

    const from0To1Migration = itwCredentialsStateMigrations[1];
    expect(from0To1Migration).toBeDefined();
    const nextState = from0To1Migration(basePersistedGlobalStateAt1);

    expect(nextState).toStrictEqual(persistedStateAt2);
  });
});
