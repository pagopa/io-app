import { addDays } from "date-fns";
import { expectSaga } from "redux-saga-test-plan";

import { walletAddCards } from "../../../../wallet/store/actions/cards";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import {
  CredentialFormat,
  CredentialMetadata
} from "../../../common/utils/itwTypesUtils";
import { itwCredentialsStore } from "../../store/actions";
import { handleItwCredentialsStoreSaga } from "../handleItwCredentialsStoreSaga";

describe("ITW handleItwCredentialsStoreSaga saga", () => {
  const jwtExpiration = "2100-09-04T00:00:00.000Z";
  const issuedAt = "2024-09-30T07:32:49.000Z";
  // A document expiring in less than 30 days must be reported as "expiring"
  const expiringDate = addDays(new Date(), 10).toISOString();

  const baseCredential = {
    issuerConf: {} as CredentialMetadata["issuerConf"],
    jwt: { issuedAt, expiration: jwtExpiration },
    spec_version: "1.0.0"
  };

  const mockedMdlSdJwt: CredentialMetadata = {
    ...baseCredential,
    credentialType: CredentialType.DRIVING_LICENSE,
    credentialId: "dc_sd_jwt_mDL",
    format: CredentialFormat.SD_JWT,
    keyTag: "1",
    parsedCredential: {
      expiry_date: { value: expiringDate, name: "expiry_date" }
    }
  };

  // Same credential in mDoc format, without the expiration claim
  const mockedMdlMdoc: CredentialMetadata = {
    ...baseCredential,
    credentialType: CredentialType.DRIVING_LICENSE,
    credentialId: "mso_mdoc_mDL",
    format: CredentialFormat.MDOC,
    keyTag: "2",
    parsedCredential: {}
  };

  const mockedEid: CredentialMetadata = {
    ...baseCredential,
    credentialType: CredentialType.PID,
    credentialId: "dc_sd_jwt_PersonIdentificationData",
    format: CredentialFormat.SD_JWT,
    keyTag: "3",
    parsedCredential: {}
  };

  it("adds a single card computed on the display format when a credential is stored in multiple formats", () =>
    expectSaga(
      handleItwCredentialsStoreSaga,
      itwCredentialsStore([mockedMdlSdJwt, mockedMdlMdoc])
    )
      .put(
        walletAddCards([
          {
            key: `ITW_${CredentialType.DRIVING_LICENSE}`,
            type: "itw",
            category: "itw",
            credentialType: CredentialType.DRIVING_LICENSE,
            credentialStatus: "expiring",
            issuedAt
          }
        ])
      )
      .run());

  it("adds a card for credentials issued only in mDoc format", () =>
    expectSaga(
      handleItwCredentialsStoreSaga,
      itwCredentialsStore([mockedMdlMdoc])
    )
      .put(
        walletAddCards([
          {
            key: `ITW_${CredentialType.DRIVING_LICENSE}`,
            type: "itw",
            category: "itw",
            credentialType: CredentialType.DRIVING_LICENSE,
            credentialStatus: "valid",
            issuedAt
          }
        ])
      )
      .run());

  it("does not add a card for the eID", () =>
    expectSaga(handleItwCredentialsStoreSaga, itwCredentialsStore([mockedEid]))
      .put(walletAddCards([]))
      .run());

  it("picks the display format regardless of the payload order", () =>
    expectSaga(
      handleItwCredentialsStoreSaga,
      itwCredentialsStore([mockedMdlMdoc, mockedEid, mockedMdlSdJwt])
    )
      .put(
        walletAddCards([
          {
            key: `ITW_${CredentialType.DRIVING_LICENSE}`,
            type: "itw",
            category: "itw",
            credentialType: CredentialType.DRIVING_LICENSE,
            credentialStatus: "expiring",
            issuedAt
          }
        ])
      )
      .run());
});
