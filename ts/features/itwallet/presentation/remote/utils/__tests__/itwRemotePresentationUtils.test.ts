import { groupCredentialsByPurpose } from "../itwRemotePresentationUtils";
import { type EnrichedPresentationDetails } from "../itwRemoteTypeUtils";

type Expected = ReturnType<typeof groupCredentialsByPurpose>;

describe("groupCredentialsByPurpose", () => {
  it("groups required credentials without an explicit purpose", () => {
    const presentationDetails: EnrichedPresentationDetails = [
      {
        id: "cred_1",
        vct: "PID",
        credential: "",
        keyTag: "keytag",
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
        vct: "PID",
        credential: "",
        keyTag: "keytag",
        purposes: [{ required: true }],
        claimsToDisplay: [{ id: "name", label: "Nome", value: "John" }],
        requiredDisclosures: [["a", "name", "John"]]
      },
      {
        id: "cred_2",
        vct: "MDL",
        credential: "",
        keyTag: "keytag",
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
        vct: "PID",
        credential: "",
        keyTag: "keytag",
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
        vct: "PID",
        credential: "",
        keyTag: "keytag",
        purposes: [{ description: "Identification", required: true }],
        claimsToDisplay: [{ id: "name", label: "Nome", value: "John" }],
        requiredDisclosures: [["a", "name", "John"]]
      },
      {
        id: "cred_2",
        vct: "MDL",
        credential: "",
        keyTag: "keytag",
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
        vct: "PID",
        credential: "",
        keyTag: "keytag",
        purposes: [
          { description: "Identification", required: true },
          { description: "Extra services", required: false }
        ],
        claimsToDisplay: [{ id: "name", label: "Nome", value: "John" }],
        requiredDisclosures: [["a", "name", "John"]]
      },
      {
        id: "cred_2",
        vct: "MDL",
        credential: "",
        keyTag: "keytag",
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
