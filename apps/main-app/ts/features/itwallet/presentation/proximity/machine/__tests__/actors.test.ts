import { ISO18013_5 } from "@pagopa/io-react-native-iso18013";
import { AnyActorLogic, createActor } from "xstate";

import { CredentialMetadata } from "../../../../common/utils/itwTypesUtils";
import { CredentialsVault } from "../../../../credentials/utils/vault";
import { VerifierRequest } from "../../utils/types";
import { sendDocumentsActor, SendDocumentsActorOutput } from "../actors";

const DOCUMENT_TYPE = "org.iso.18013.5.1.mDL";
const MISSING_DOCUMENT_TYPE = "org.iso.18013.5.1.missing";
const credential = {
  credentialId: "mso_mdoc_mDL",
  keyTag: "credential-key-tag"
} as CredentialMetadata;
const verifierRequest = {
  request: {
    [DOCUMENT_TYPE]: {
      "org.iso.18013.5.1": { family_name: false },
      isAuthenticated: true
    },
    [MISSING_DOCUMENT_TYPE]: {
      "org.iso.18013.5.1": { unknown_field: false },
      isAuthenticated: true
    }
  }
} as unknown as VerifierRequest;

const runActor = async <TOutput>(logic: AnyActorLogic, input: unknown) =>
  new Promise<TOutput>((resolve, reject) => {
    const actor = createActor(logic, { input });
    actor.subscribe({
      next: snapshot => {
        if (snapshot.status === "done") {
          resolve(snapshot.output as TOutput);
        }
      },
      error: reject
    });
    actor.start();
  });

describe("proximity actors", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it("sends only requested documents available in the wallet", async () => {
    jest.useFakeTimers();
    jest.spyOn(CredentialsVault, "get").mockResolvedValue("signed-content");
    const generateResponse = jest
      .mocked(ISO18013_5.generateResponse)
      .mockResolvedValue("generated-response");
    jest.mocked(ISO18013_5.sendResponse).mockResolvedValue(true);

    await runActor<SendDocumentsActorOutput>(sendDocumentsActor, {
      credentials: { [DOCUMENT_TYPE]: credential },
      verifierRequest,
      deps: {
        env: { type: "prod" },
        navigation: {} as never,
        store: {} as never
      }
    });

    expect(generateResponse).toHaveBeenCalledWith(
      [
        {
          alias: credential.keyTag,
          docType: DOCUMENT_TYPE,
          issuerSignedContent: "signed-content"
        }
      ],
      {
        [DOCUMENT_TYPE]: {
          "org.iso.18013.5.1": { family_name: true }
        }
      }
    );
  });
});
