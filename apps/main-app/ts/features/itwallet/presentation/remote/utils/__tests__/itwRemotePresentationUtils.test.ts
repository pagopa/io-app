import { getCredentialStatus } from "../../../../common/utils/itwCredentialStatusUtils";
import { CredentialType } from "../../../../common/utils/itwMocksUtils";
import {
  CredentialMetadata,
  ItwCredentialStatus
} from "../../../../common/utils/itwTypesUtils";
import {
  enrichPresentationDetails,
  getCredentialTypeByVct,
  getInvalidCredentials,
  groupCredentialsByPurpose
} from "../itwRemotePresentationUtils";
import {
  PresentationDetails,
  type EnrichedPresentationDetails
} from "../itwRemoteTypeUtils";

jest.mock("../../../../common/utils/itwCredentialStatusUtils");

const mockGetCredentialStatus = getCredentialStatus as jest.MockedFunction<
  typeof getCredentialStatus
>;

type Expected = ReturnType<typeof groupCredentialsByPurpose>;

describe("groupCredentialsByPurpose", () => {
  it("groups required credentials without an explicit purpose", () => {
    const presentationDetails: EnrichedPresentationDetails = [
      {
        id: "cred_1",
        format: "dc+sd-jwt",
        vct: "https://pre.ta.wallet.ipzs.it/vct/v1.0.0/personidentificationdata",
        credential: "",
        keyTag: "keytag",
        purposes: [{ required: true }],
        claimsToDisplay: [{ id: "name", label: "Nome", value: "John" }],
        requiredDisclosures: [{ name: "name", value: "John" }],
        presentationFrame: { name: true }
      }
    ];

    const expected: Expected = {
      required: [{ purpose: "", credentials: presentationDetails }],
      optional: []
    };

    expect(groupCredentialsByPurpose(presentationDetails)).toEqual(expected);
  });

  it("groups required and optional credentials without an explicit purpose", () => {
    const presentationDetails: EnrichedPresentationDetails = [
      {
        id: "cred_1",
        format: "dc+sd-jwt",
        vct: "https://pre.ta.wallet.ipzs.it/vct/v1.0.0/personidentificationdata",
        credential: "",
        keyTag: "keytag",
        purposes: [{ required: true }],
        claimsToDisplay: [{ id: "name", label: "Nome", value: "John" }],
        requiredDisclosures: [{ name: "name", value: "John" }],
        presentationFrame: { name: true }
      },
      {
        id: "cred_2",
        format: "dc+sd-jwt",
        vct: "https://pre.ta.wallet.ipzs.it/vct/v1.0.0/mdl",
        credential: "",
        keyTag: "keytag",
        purposes: [{ required: false }],
        claimsToDisplay: [{ id: "taxcode", label: "Codice", value: "123" }],
        requiredDisclosures: [{ name: "taxcode", value: "123" }],
        presentationFrame: { taxcode: true }
      }
    ];

    const expected: Expected = {
      required: [{ purpose: "", credentials: [presentationDetails[0]] }],
      optional: [{ purpose: "", credentials: [presentationDetails[1]] }]
    };

    expect(groupCredentialsByPurpose(presentationDetails)).toEqual(expected);
  });

  it("groups required credentials with an explicit purpose", () => {
    const presentationDetails: EnrichedPresentationDetails = [
      {
        id: "cred_1",
        format: "dc+sd-jwt",
        vct: "https://pre.ta.wallet.ipzs.it/vct/v1.0.0/personidentificationdata",
        credential: "",
        keyTag: "keytag",
        purposes: [{ description: "Identification", required: true }],
        claimsToDisplay: [{ id: "name", label: "Nome", value: "John" }],
        requiredDisclosures: [{ name: "name", value: "John" }],
        presentationFrame: { name: true }
      }
    ];

    const expected: Expected = {
      required: [
        { purpose: "Identification", credentials: presentationDetails }
      ],
      optional: []
    };

    expect(groupCredentialsByPurpose(presentationDetails)).toEqual(expected);
  });

  it("groups required and optional credentials with an explicit purpose", () => {
    const presentationDetails: EnrichedPresentationDetails = [
      {
        id: "cred_1",
        format: "dc+sd-jwt",
        vct: "https://pre.ta.wallet.ipzs.it/vct/v1.0.0/personidentificationdata",
        credential: "",
        keyTag: "keytag",
        purposes: [{ description: "Identification", required: true }],
        claimsToDisplay: [{ id: "name", label: "Nome", value: "John" }],
        requiredDisclosures: [{ name: "name", value: "John" }],
        presentationFrame: { name: true }
      },
      {
        id: "cred_2",
        format: "dc+sd-jwt",
        vct: "https://pre.ta.wallet.ipzs.it/vct/v1.0.0/mdl",
        credential: "",
        keyTag: "keytag",
        purposes: [{ description: "Extra services", required: false }],
        claimsToDisplay: [{ id: "taxcode", label: "Codice", value: "123" }],
        requiredDisclosures: [{ name: "taxcode", value: "123" }],
        presentationFrame: { taxcode: true }
      }
    ];

    const expected: Expected = {
      required: [
        { purpose: "Identification", credentials: [presentationDetails[0]] }
      ],
      optional: [
        { purpose: "Extra services", credentials: [presentationDetails[1]] }
      ]
    };

    expect(groupCredentialsByPurpose(presentationDetails)).toEqual(expected);
  });

  it("groups required and optional credentials with multiple overlapping explicit purposes", () => {
    const presentationDetails: EnrichedPresentationDetails = [
      {
        id: "cred_1",
        format: "dc+sd-jwt",
        vct: "https://pre.ta.wallet.ipzs.it/vct/v1.0.0/personidentificationdata",
        credential: "",
        keyTag: "keytag",
        purposes: [
          { description: "Identification", required: true },
          { description: "Extra services", required: false }
        ],
        claimsToDisplay: [{ id: "name", label: "Nome", value: "John" }],
        requiredDisclosures: [{ name: "name", value: "John" }],
        presentationFrame: { name: true }
      },
      {
        id: "cred_2",
        format: "dc+sd-jwt",
        vct: "https://pre.ta.wallet.ipzs.it/vct/v1.0.0/mdl",
        credential: "",
        keyTag: "keytag",
        purposes: [
          { description: "Extra services", required: false },
          { description: "Top service", required: false }
        ],
        claimsToDisplay: [{ id: "taxcode", label: "Codice", value: "123" }],
        requiredDisclosures: [{ name: "taxcode", value: "123" }],
        presentationFrame: { taxcode: true }
      }
    ];

    const expected: Expected = {
      required: [
        { purpose: "Identification", credentials: [presentationDetails[0]] }
      ],
      optional: [
        { purpose: "Extra services", credentials: presentationDetails },
        { purpose: "Top service", credentials: [presentationDetails[1]] }
      ]
    };

    expect(groupCredentialsByPurpose(presentationDetails)).toEqual(expected);
  });
});

describe("enrichPresentationDetails", () => {
  const storedCredentialMock = {
    credentialType: "PID",
    parsedCredential: {
      name: {
        value: "Mario",
        name: { "it-IT": "Nome", "en-US": "Name" }
      },
      surname: {
        value: "Rossi",
        name: { "it-IT": "Cognome", "en-US": "Surname" }
      }
    }
  } as unknown as CredentialMetadata;

  it("should include all disclosures that are found in the parsed credential", () => {
    const [result] = enrichPresentationDetails(
      [
        {
          id: "one",
          credential: "",
          keyTag: "one-keytag",
          format: "dc+sd-jwt",
          vct: "https://pre.ta.wallet.ipzs.it/vct/v1.0.0/personidentificationdata",
          requiredDisclosures: [
            { name: "name", value: "Mario" },
            { name: "surname", value: "Rossi" }
          ],
          purposes: [{ required: true }],
          presentationFrame: { name: true, surname: true }
        }
      ],
      { pid: storedCredentialMock }
    );

    expect(result.claimsToDisplay).toEqual([
      { id: "name", label: "Nome", value: "Mario" },
      { id: "surname", label: "Cognome", value: "Rossi" }
    ]);
  });

  it("should exclude disclosures that are missing in the parsed credential", () => {
    const [result] = enrichPresentationDetails(
      [
        {
          id: "one",
          credential: "",
          keyTag: "one-keytag",
          format: "dc+sd-jwt",
          vct: "https://pre.ta.wallet.ipzs.it/vct/v1.0.0/personidentificationdata",
          requiredDisclosures: [
            { name: "name", value: "Mario" },
            { name: "surname", value: "Rossi" },
            { name: "iat", value: 123456 }
          ],
          purposes: [{ required: true }],
          presentationFrame: { name: true, surname: true, iat: true }
        }
      ],
      { pid: storedCredentialMock }
    );

    expect(result.claimsToDisplay).toEqual([
      { id: "name", label: "Nome", value: "Mario" },
      { id: "surname", label: "Cognome", value: "Rossi" }
    ]);
  });

  it("should work even when a credential is not found", () => {
    const missingCredentialDetails: PresentationDetails[number] = {
      id: "one",
      credential: "",
      keyTag: "one-keytag",
      format: "dc+sd-jwt",
      vct: "missing_PID",
      requiredDisclosures: [
        { name: "name", value: "Mario" },
        { name: "surname", value: "Rossi" },
        { name: "iat", value: 123456 }
      ],
      purposes: [{ required: true }],
      presentationFrame: { name: true, surname: true, iat: true }
    };
    expect(
      enrichPresentationDetails([missingCredentialDetails], {
        pid: storedCredentialMock
      })
    ).toEqual([
      {
        ...missingCredentialDetails,
        claimsToDisplay: []
      }
    ]);
  });
});

describe("getCredentialTypeByVct - https format", () => {
  test.each([
    [
      CredentialType.PID,
      "https://pre.ta.wallet.ipzs.it/vct/v1.0.0/personidentificationdata"
    ],
    [
      CredentialType.PID,
      "https://pre.ta.wallet.ipzs.it/vct/personidentificationdata"
    ],
    [
      CredentialType.PID,
      "https://pre.ta.wallet.ipzs.it/vct/v1.0.0/path1/path2/personidentificationdata"
    ],
    [
      CredentialType.DRIVING_LICENSE,
      "https://pre.ta.wallet.ipzs.it/vct/v1.0.0/mdl"
    ],
    [
      CredentialType.EUROPEAN_DISABILITY_CARD,
      "https://pre.ta.wallet.ipzs.it/vct/v1.0.0/europeandisabilitycard"
    ],
    [
      CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
      "https://pre.ta.wallet.ipzs.it/vct/v1.0.0/europeanhealthinsurancecard"
    ],
    [undefined, "https://pre.ta.wallet.ipzs.it/novct/mdl"],
    [
      undefined,
      "https://pre.ta.wallet.ipzs.it/schemas/v1.0.0/personidentificationdata.json"
    ]
  ])("extracts %s from %s", (expected, vct) => {
    expect(getCredentialTypeByVct(vct)).toEqual(expected);
  });
});

describe("getCredentialTypeByVct - urn format", () => {
  test.each([
    [CredentialType.PID, "urn:it-wallet:pid:1"],
    [CredentialType.PID, "urn:it-wallet:pid:1.2.3"],
    [CredentialType.PID, "urn:it-wallet:pid"],
    [CredentialType.PID, "urn:eudi:pid:it:1"],
    [CredentialType.DRIVING_LICENSE, "urn:it-wallet:mDL:1"],
    [
      CredentialType.EUROPEAN_DISABILITY_CARD,
      "urn:it-wallet:EuropeanDisabilityCard:1"
    ],
    [
      CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
      "urn:it-wallet:EuropeanHealthInsuranceCard:1"
    ],
    [
      CredentialType.EDUCATION_ENROLLMENT,
      "urn:it-wallet:education_enrollment:"
    ],
    [CredentialType.EDUCATION_DEGREE, "urn:it-wallet:education_degree:1"],
    [undefined, "noturn:it-wallet:pid:1"],
    [undefined, "urn:wrong"]
  ])("extracts %s from %s", (expected, vct) => {
    expect(getCredentialTypeByVct(vct)).toEqual(expected);
  });
});

describe("getInvalidCredentials", () => {
  const PID_VCT = "urn:it-wallet:pid:1";
  const MDL_VCT = "urn:it-wallet:mDL:1";

  // Builds a presentation detail for the given vct (only format and vct are used)
  const detail = (vct: string): PresentationDetails[number] =>
    ({ format: "dc+sd-jwt", vct }) as unknown as PresentationDetails[number];
  // Builds a stored credential whose status is resolved by the mocked getCredentialStatus
  const credential = (
    credentialType: string,
    status: ItwCredentialStatus
  ): CredentialMetadata =>
    ({ credentialType, status }) as unknown as CredentialMetadata;
  beforeEach(() => {
    mockGetCredentialStatus.mockImplementation(
      c => (c as unknown as { status: ItwCredentialStatus }).status
    );
  });

  type Scenario = {
    name: string;
    details: PresentationDetails;
    credentialsByType: Record<string, CredentialMetadata | undefined>;
    expected: Array<string>;
  };

  const scenarios: Array<Scenario> = [
    {
      name: "allows a valid PID and a valid EAA",
      details: [detail(PID_VCT), detail(MDL_VCT)],
      credentialsByType: {
        [CredentialType.PID]: credential(CredentialType.PID, "valid"),
        [CredentialType.DRIVING_LICENSE]: credential(
          CredentialType.DRIVING_LICENSE,
          "valid"
        )
      },
      expected: []
    },
    {
      name: "allows an expired EAA presented alone",
      details: [detail(MDL_VCT)],
      credentialsByType: {
        [CredentialType.DRIVING_LICENSE]: credential(
          CredentialType.DRIVING_LICENSE,
          "expired"
        )
      },
      expected: []
    },
    {
      name: "allows a jwtExpired EAA presented alone",
      details: [detail(MDL_VCT)],
      credentialsByType: {
        [CredentialType.DRIVING_LICENSE]: credential(
          CredentialType.DRIVING_LICENSE,
          "jwtExpired"
        )
      },
      expected: []
    },
    {
      name: "allows an EAA with unknown status presented alone",
      details: [detail(MDL_VCT)],
      credentialsByType: {
        [CredentialType.DRIVING_LICENSE]: credential(
          CredentialType.DRIVING_LICENSE,
          "unknown"
        )
      },
      expected: []
    },
    {
      name: "blocks a revoked EAA",
      details: [detail(MDL_VCT)],
      credentialsByType: {
        [CredentialType.DRIVING_LICENSE]: credential(
          CredentialType.DRIVING_LICENSE,
          "invalid"
        )
      },
      expected: [CredentialType.DRIVING_LICENSE]
    },
    {
      name: "blocks a jwtExpired PID requested with a valid EAA",
      details: [detail(PID_VCT), detail(MDL_VCT)],
      credentialsByType: {
        [CredentialType.PID]: credential(CredentialType.PID, "jwtExpired"),
        [CredentialType.DRIVING_LICENSE]: credential(
          CredentialType.DRIVING_LICENSE,
          "valid"
        )
      },
      expected: [CredentialType.PID]
    },
    {
      name: "blocks an expired PID",
      details: [detail(PID_VCT)],
      credentialsByType: {
        [CredentialType.PID]: credential(CredentialType.PID, "expired")
      },
      expected: [CredentialType.PID]
    },
    {
      name: "blocks a PID with unknown status",
      details: [detail(PID_VCT)],
      credentialsByType: {
        [CredentialType.PID]: credential(CredentialType.PID, "unknown")
      },
      expected: [CredentialType.PID]
    },
    {
      name: "blocks both a non-valid PID and a revoked EAA",
      details: [detail(PID_VCT), detail(MDL_VCT)],
      credentialsByType: {
        [CredentialType.PID]: credential(CredentialType.PID, "jwtExpired"),
        [CredentialType.DRIVING_LICENSE]: credential(
          CredentialType.DRIVING_LICENSE,
          "invalid"
        )
      },
      expected: [CredentialType.PID, CredentialType.DRIVING_LICENSE]
    }
  ];

  test.each(scenarios)("$name", ({ details, credentialsByType, expected }) => {
    expect(getInvalidCredentials(details, credentialsByType)).toEqual(expected);
  });
});
