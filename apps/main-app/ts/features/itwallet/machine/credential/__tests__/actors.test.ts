import { waitForSessionRefreshActor } from "../../utils/actors";
import {
  getWalletAttestationActor,
  obtainAccessTokenActor,
  obtainCredentialActor,
  obtainCredentialStatusActor,
  processCredentialOfferActor,
  requestCredentialActor,
  verifyTrustFederationActor
} from "../actors";
import { itwCredentialIssuanceMachine } from "../machine";

describe("credential issuance actors", () => {
  /**
   * `machine.provide()` accepts partial implementations, so a missing actor is
   * not caught by the type-checker and only surfaces at runtime as a
   * `notImplemented` crash (e.g. `waitForSessionRefreshActor` when the session
   * expires). Non-regression: named exports plus the shared session-refresh
   * actor must cover every actor declared in the machine setup.
   */
  it("implements every actor declared in the machine setup", () => {
    const actors = {
      verifyTrustFederation: verifyTrustFederationActor,
      getWalletAttestation: getWalletAttestationActor,
      requestCredential: requestCredentialActor,
      obtainAccessToken: obtainAccessTokenActor,
      obtainCredential: obtainCredentialActor,
      obtainCredentialStatus: obtainCredentialStatusActor,
      processCredentialOffer: processCredentialOfferActor,
      waitForSessionRefresh: waitForSessionRefreshActor
    };

    const declaredActors = Object.keys(
      itwCredentialIssuanceMachine.implementations.actors
    );
    const implementedActors = Object.keys(actors);

    expect(declaredActors).not.toHaveLength(0);
    expect(implementedActors).toEqual(expect.arrayContaining(declaredActors));
    expect(implementedActors).toHaveLength(declaredActors.length);
  });
});
