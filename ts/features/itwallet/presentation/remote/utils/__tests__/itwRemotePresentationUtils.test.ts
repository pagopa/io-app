import { createCryptoContextFor } from "@pagopa/io-react-native-wallet";
import {
  enrichPresentationDetails,
  getCredentialTypeByVct,
  groupCredentialsByPurpose
} from "../itwRemotePresentationUtils";
import {
  PresentationDetails,
  type EnrichedPresentationDetails
} from "../itwRemoteTypeUtils";
import { CredentialType } from "../../../../common/utils/itwMocksUtils";
import { CredentialMetadata } from "../../../../common/utils/itwTypesUtils";

type Expected = ReturnType<typeof groupCredentialsByPurpose>;

describe("groupCredentialsByPurpose", () => {
  it("groups required credentials without an explicit purpose", () => {
    const presentationDetails: EnrichedPresentationDetails = [
      {
        id: "cred_1",
        vct: "https://pre.ta.wallet.ipzs.it/vct/v1.0.0/personidentificationdata",
        credential: "",
        cryptoContext: createCryptoContextFor("keytag"),
        purposes: [{ required: true }],
        claimsToDisplay: [{ id: "name", label: "Nome", value: "John" }],
        requiredDisclosures: [["a", "name", "John"]]
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
        vct: "https://pre.ta.wallet.ipzs.it/vct/v1.0.0/personidentificationdata",
        credential: "",
        cryptoContext: createCryptoContextFor("keytag"),
        purposes: [{ required: true }],
        claimsToDisplay: [{ id: "name", label: "Nome", value: "John" }],
        requiredDisclosures: [["a", "name", "John"]]
      },
      {
        id: "cred_2",
        vct: "https://pre.ta.wallet.ipzs.it/vct/v1.0.0/mdl",
        credential: "",
        cryptoContext: createCryptoContextFor("keytag"),
        purposes: [{ required: false }],
        claimsToDisplay: [{ id: "taxcode", label: "Codice", value: "123" }],
        requiredDisclosures: [["b", "taxcode", "123"]]
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
        vct: "https://pre.ta.wallet.ipzs.it/vct/v1.0.0/personidentificationdata",
        credential: "",
        cryptoContext: createCryptoContextFor("keytag"),
        purposes: [{ description: "Identification", required: true }],
        claimsToDisplay: [{ id: "name", label: "Nome", value: "John" }],
        requiredDisclosures: [["a", "name", "John"]]
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
        vct: "https://pre.ta.wallet.ipzs.it/vct/v1.0.0/personidentificationdata",
        credential: "",
        cryptoContext: createCryptoContextFor("keytag"),
        purposes: [{ description: "Identification", required: true }],
        claimsToDisplay: [{ id: "name", label: "Nome", value: "John" }],
        requiredDisclosures: [["a", "name", "John"]]
      },
      {
        id: "cred_2",
        vct: "https://pre.ta.wallet.ipzs.it/vct/v1.0.0/mdl",
        credential: "",
        cryptoContext: createCryptoContextFor("keytag"),
        purposes: [{ description: "Extra services", required: false }],
        claimsToDisplay: [{ id: "taxcode", label: "Codice", value: "123" }],
        requiredDisclosures: [["b", "taxcode", "123"]]
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
        vct: "https://pre.ta.wallet.ipzs.it/vct/v1.0.0/personidentificationdata",
        credential: "",
        cryptoContext: createCryptoContextFor("keytag"),
        purposes: [
          { description: "Identification", required: true },
          { description: "Extra services", required: false }
        ],
        claimsToDisplay: [{ id: "name", label: "Nome", value: "John" }],
        requiredDisclosures: [["a", "name", "John"]]
      },
      {
        id: "cred_2",
        vct: "https://pre.ta.wallet.ipzs.it/vct/v1.0.0/mdl",
        credential: "",
        cryptoContext: createCryptoContextFor("keytag"),
        purposes: [
          { description: "Extra services", required: false },
          { description: "Top service", required: false }
        ],
        claimsToDisplay: [{ id: "taxcode", label: "Codice", value: "123" }],
        requiredDisclosures: [["b", "taxcode", "123"]]
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
          cryptoContext: createCryptoContextFor("one-keytag"),
          vct: "https://pre.ta.wallet.ipzs.it/vct/v1.0.0/personidentificationdata",
          requiredDisclosures: [
            ["salt1", "name", "Mario"],
            ["salt2", "surname", "Rossi"]
          ],
          purposes: [{ required: true }]
        }
      ],
      { PersonIdentificationData: storedCredentialMock }
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
          cryptoContext: createCryptoContextFor("one-keytag"),
          vct: "https://pre.ta.wallet.ipzs.it/vct/v1.0.0/personidentificationdata",
          requiredDisclosures: [
            ["salt1", "name", "Mario"],
            ["salt2", "surname", "Rossi"],
            ["salt3", "iat", 123456]
          ],
          purposes: [{ required: true }]
        }
      ],
      { PersonIdentificationData: storedCredentialMock }
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
      cryptoContext: createCryptoContextFor("one-keytag"),
      vct: "missing_PID",
      requiredDisclosures: [
        ["salt1", "name", "Mario"],
        ["salt2", "surname", "Rossi"],
        ["salt3", "iat", 123456]
      ],
      purposes: [{ required: true }]
    };
    expect(
      enrichPresentationDetails([missingCredentialDetails], {
        PersonIdentificationData: storedCredentialMock
      })
    ).toEqual([
      {
        ...missingCredentialDetails,
        claimsToDisplay: []
      }
    ]);
  });
});

describe("getCredentialTypeByVct", () => {
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
