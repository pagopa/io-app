import MockDate from "mockdate";

import { getCredentialStatus } from "../../../common/utils/itwCredentialStatusUtils";
import {
  CredentialMetadata,
  CredentialValidity,
  ItwCredentialStatus,
  ParsedStatusAssertion
} from "../../../common/utils/itwTypesUtils";
import {
  applyStatusToCredential,
  getAvailableStatusOverrides
} from "../itwDebugCredentialUtils";

const NOW = new Date(2026, 6, 24, 12);

const baseValidity: CredentialValidity = {
  rawStatus: "0x00",
  status: "valid",
  statusList: {
    idx: 42,
    uri: "https://issuer.example/status-list"
  },
  type: "status_list"
};

const baseCredential: CredentialMetadata = {
  credentialId: "dc_sd_jwt_mDL",
  credentialType: "mDL",
  format: "dc+sd-jwt",
  issuerConf: {} as CredentialMetadata["issuerConf"],
  jwt: {
    expiration: "2030-01-01T00:00:00.000Z",
    issuedAt: "2026-01-01T00:00:00.000Z"
  },
  keyTag: "key-tag",
  keyTags: ["key-tag", "key-tag-copy"],
  parsedCredential: {
    expiry_date: {
      name: { "en-US": "Expiry date", "it-IT": "Scadenza" },
      value: "2030-01-01"
    },
    given_name: {
      name: { "en-US": "Name", "it-IT": "Nome" },
      value: "Mario"
    }
  },
  spec_version: "1.3.3",
  validity: baseValidity,
  walletUnitAttestationId: "wallet-unit-attestation-id"
};

const statusAssertion: ParsedStatusAssertion = {
  credential_hash: "credential-hash",
  credential_hash_alg: "sha-256",
  credential_status_type: "urn:eudi:pid:it:1",
  exp: 1_800_000_000,
  iat: 1_700_000_000,
  iss: "https://issuer.example"
};

const legacyCredential: CredentialMetadata = {
  ...baseCredential,
  spec_version: "1.0.0",
  validity: {
    status: "valid",
    statusAssertion,
    type: "status_assertion"
  }
};

const statuses: ReadonlyArray<ItwCredentialStatus> = [
  "valid",
  "invalid",
  "suspended",
  "expiring",
  "expired",
  "jwtExpiring",
  "jwtExpired",
  "unknown"
];

const transitions = statuses.flatMap(initialStatus =>
  statuses.map(targetStatus => ({
    initialStatus,
    name: `${initialStatus} → ${targetStatus}`,
    targetStatus
  }))
);

describe("applyStatusToCredential", () => {
  beforeAll(() => {
    MockDate.set(NOW);
  });

  afterAll(() => {
    MockDate.reset();
  });

  test.each(transitions)(
    "applies $name deterministically",
    ({ initialStatus, targetStatus }) => {
      const initialCredential = applyStatusToCredential(
        baseCredential,
        initialStatus
      );

      const result = applyStatusToCredential(initialCredential, targetStatus);

      expect(getCredentialStatus(result)).toBe(targetStatus);
    }
  );

  test.each(statuses)(
    "preserves identifiers and cryptographic references when applying %s",
    targetStatus => {
      const result = applyStatusToCredential(baseCredential, targetStatus);

      expect(result).toMatchObject({
        credentialId: baseCredential.credentialId,
        credentialType: baseCredential.credentialType,
        format: baseCredential.format,
        keyTag: baseCredential.keyTag,
        keyTags: baseCredential.keyTags,
        spec_version: baseCredential.spec_version,
        walletUnitAttestationId: baseCredential.walletUnitAttestationId
      });
      expect(result.issuerConf).toBe(baseCredential.issuerConf);
      expect(result.parsedCredential.given_name).toBe(
        baseCredential.parsedCredential.given_name
      );
      expect(result.validity).toMatchObject({
        statusList: baseValidity.statusList,
        type: "status_list"
      });
    }
  );

  it("normalizes status-list validity when applying valid", () => {
    const invalidCredential = applyStatusToCredential(
      baseCredential,
      "invalid"
    );

    expect(
      applyStatusToCredential(invalidCredential, "valid").validity
    ).toEqual({
      ...baseValidity,
      rawStatus: "0x00",
      status: "valid"
    });
  });

  test.each([
    {
      expectedValidity: {
        errorCode: "credential_revoked",
        status: "invalid",
        type: "status_assertion"
      },
      status: "invalid" as const
    },
    {
      expectedValidity: {
        status: "unknown",
        type: "status_assertion"
      },
      status: "unknown" as const
    }
  ])(
    "applies $status using status-assertion validity",
    ({ expectedValidity, status }) => {
      expect(
        applyStatusToCredential(legacyCredential, status).validity
      ).toEqual(expectedValidity);
    }
  );

  it("creates an expiry date only when applying the expiring status", () => {
    const credentialWithoutExpiry = {
      ...baseCredential,
      parsedCredential: {
        given_name: baseCredential.parsedCredential.given_name
      }
    } as CredentialMetadata;

    const expiringCredential = applyStatusToCredential(
      credentialWithoutExpiry,
      "expiring"
    );
    const validCredential = applyStatusToCredential(
      credentialWithoutExpiry,
      "valid"
    );

    expect(expiringCredential.parsedCredential.expiry_date).toBeDefined();
    expect(validCredential.parsedCredential.expiry_date).toBeUndefined();
  });
});

describe("getAvailableStatusOverrides", () => {
  it("only returns JWT statuses for the PID", () => {
    expect(getAvailableStatusOverrides("pid")).toEqual([
      "valid",
      "jwtExpiring",
      "jwtExpired"
    ]);
  });

  it("returns every supported status for other credential types", () => {
    expect(getAvailableStatusOverrides("mDL")).toEqual(statuses);
  });
});
