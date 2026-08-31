import { type CredentialStatus } from "@pagopa/io-react-native-wallet";
import { testSaga } from "redux-saga-test-plan";

import {
  CredentialMetadata,
  CredentialValidity
} from "../../../common/utils/itwTypesUtils";
import { itwCredentialsStore } from "../../../credentials/store/actions";
import { itwAllStoredCredentialsSelector } from "../../../credentials/store/selectors";
import { updateCredentialsStatusSaga } from "../updateCredentialsStatusSaga";

const mockGetStatus = jest.fn();

jest.mock("../../../common/utils/itwIoWallet", () => ({
  getIoWallet: jest.fn(() => ({
    CredentialStatus: {
      statusList: {
        isSupported: true,
        getStatus: mockGetStatus
      }
    }
  }))
}));

const URI = "https://issuer.example/status/1";

const makeStatusList = (): CredentialStatus.StatusList => ({
  sub: URI,
  iat: 1690000000,
  exp: 1700000000,
  status_list: { bits: 2, lst: "eNrbuRgAAhcBXQ" }
});

const makeCredential = (): CredentialMetadata => {
  const validity: CredentialValidity = {
    type: "status_list",
    status: "valid",
    rawStatus: "0x00",
    statusList: { idx: 1, uri: URI }
  };

  return {
    credentialId: "credential-1",
    credentialType: "mDL",
    format: "dc+sd-jwt",
    issuerConf: {} as CredentialMetadata["issuerConf"],
    jwt: {
      expiration: "2100-01-01T00:00:00.000Z"
    },
    keyTag: "key-1",
    parsedCredential: {},
    spec_version: "1.3.3",
    validity
  };
};

describe("updateCredentialsStatusSaga", () => {
  beforeEach(() => {
    mockGetStatus.mockReset();
  });

  it("updates changed status-list validity and ignores credentials without a status list", () => {
    const credential = makeCredential();
    const credentialWithoutStatusList = {
      ...credential,
      credentialId: "credential-2",
      validity: undefined
    };
    const updatedCredential = {
      ...credential,
      validity: {
        type: "status_list" as const,
        status: "invalid",
        rawStatus: "0x01",
        statusList: { idx: 1, uri: URI }
      }
    };
    const statusList = makeStatusList();
    mockGetStatus.mockReturnValue({
      status: "INVALID",
      rawStatus: "0x01"
    });

    testSaga(updateCredentialsStatusSaga, { itwVersion: "1.3.3" })
      .next()
      .select(itwAllStoredCredentialsSelector)
      .next([credential, credentialWithoutStatusList])
      .next([statusList])
      .put(itwCredentialsStore([updatedCredential]))
      .next()
      .isDone();

    expect(mockGetStatus).toHaveBeenCalledWith(statusList.status_list, 1);
  });

  it("does not dispatch when the cached status does not change validity", () => {
    const credential = makeCredential();
    mockGetStatus.mockReturnValue({
      status: "VALID",
      rawStatus: "0x00"
    });

    testSaga(updateCredentialsStatusSaga, { itwVersion: "1.3.3" })
      .next()
      .select(itwAllStoredCredentialsSelector)
      .next([credential])
      .next([makeStatusList()])
      .next()
      .isDone();
  });

  it("skips credentials whose status list is not cached", () => {
    const credential = makeCredential();

    testSaga(updateCredentialsStatusSaga, { itwVersion: "1.3.3" })
      .next()
      .select(itwAllStoredCredentialsSelector)
      .next([credential])
      .next([undefined])
      .isDone();
  });
});
