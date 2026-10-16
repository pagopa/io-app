import { type CredentialStatus } from "@pagopa/io-react-native-wallet";
import { testSaga } from "redux-saga-test-plan";

import { itwStatusListReferencedUrisSelector } from "../../store/selectors";
import { StatusListRepository } from "../../utils/repository";
import { checkStatusListCoherenceSaga } from "../checkStatusListCoherenceSaga";

const makePayload = (sub: string): CredentialStatus.StatusList => ({
  sub,
  iat: 1690000000,
  exp: 1700000000,
  status_list: { bits: 2, lst: "eNrbuRgAAhcBXQ" }
});

describe("checkStatusListCoherenceSaga", () => {
  it("removes cached URIs that are no longer referenced", () => {
    const referencedUris = ["https://issuer.example/status/1"];
    const cached = [
      makePayload("https://issuer.example/status/1"),
      makePayload("https://issuer.example/status/2")
    ];

    testSaga(checkStatusListCoherenceSaga)
      .next()
      .select(itwStatusListReferencedUrisSelector)
      .next(referencedUris)
      .call(StatusListRepository.list)
      .next(cached)
      .call(StatusListRepository.removeMany, [
        "https://issuer.example/status/2"
      ])
      .next()
      .isDone();
  });

  it("does not remove anything when every cached URI is referenced", () => {
    const referencedUris = [
      "https://issuer.example/status/1",
      "https://issuer.example/status/1"
    ];
    const cached = [makePayload("https://issuer.example/status/1")];

    testSaga(checkStatusListCoherenceSaga)
      .next()
      .select(itwStatusListReferencedUrisSelector)
      .next(referencedUris)
      .call(StatusListRepository.list)
      .next(cached)
      .next()
      .isDone();
  });
});
