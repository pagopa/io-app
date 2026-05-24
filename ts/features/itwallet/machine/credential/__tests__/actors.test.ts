import type {
  CredentialOffer,
  ItwVersion
} from "@pagopa/io-react-native-wallet";
import { createActor, waitFor } from "xstate";
import type { useIOStore } from "../../../../../store/hooks";
import type { Env } from "../../../common/utils/environment";
import { getIoWallet } from "../../../common/utils/itwIoWallet";
import { createCredentialIssuanceActorsImplementation } from "../actors";

jest.mock("../../../common/utils/itwIoWallet", () => ({
  getIoWallet: jest.fn()
}));

const T_CREDENTIAL_OFFER_URI =
  "openid-credential-offer://?credential_offer_uri=https://issuer.example/offers/123";
const T_CREDENTIAL_ISSUER = "https://issuer.example";
const T_CREDENTIAL_SCOPE = "education_degree";

describe("createCredentialIssuanceActorsImplementation", () => {
  const mockGetIoWallet = jest.mocked(getIoWallet);

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("uses the injected IT-Wallet specs version to process credential offers", async () => {
    const itwVersion: ItwVersion = "1.0.0";
    const offer = {
      credential_issuer: T_CREDENTIAL_ISSUER
    } as CredentialOffer.CredentialOffer;
    const grantDetails = {
      authorizationCodeGrant: {
        scope: T_CREDENTIAL_SCOPE,
        authorizationServer: T_CREDENTIAL_ISSUER
      }
    } as CredentialOffer.ExtractGrantDetailsResult;
    const resolveCredentialOffer = jest.fn(() => Promise.resolve(offer));
    const extractGrantDetails = jest.fn(() => grantDetails);

    mockGetIoWallet.mockReturnValue({
      CredentialsOffer: {
        resolveCredentialOffer,
        extractGrantDetails
      }
    } as unknown as ReturnType<typeof getIoWallet>);

    const { processCredentialOffer } =
      createCredentialIssuanceActorsImplementation(
        {} as Env,
        itwVersion,
        {} as ReturnType<typeof useIOStore>
      );
    const actor = createActor(processCredentialOffer, {
      input: { credentialOfferUri: T_CREDENTIAL_OFFER_URI }
    });

    actor.start();
    const snapshot = await waitFor(actor, state => state.status === "done");

    expect(mockGetIoWallet).toHaveBeenCalledWith(itwVersion);
    expect(resolveCredentialOffer).toHaveBeenCalledWith(T_CREDENTIAL_OFFER_URI);
    expect(extractGrantDetails).toHaveBeenCalledWith(offer);
    expect(snapshot.output).toStrictEqual({ offer, grantDetails });
  });
});
