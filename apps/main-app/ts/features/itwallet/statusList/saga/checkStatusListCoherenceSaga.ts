import { call, select } from "typed-redux-saga/macro";
import { itwStatusListReferencedUrisSelector } from "../store/selectors";
import { StatusListRepository } from "../utils/repository";

/**
 * Runs startup coherence for the Status List Token cache pruning stored entries
 * no longer referenced by any owner
 */
export function* checkStatusListCoherenceSaga() {
  const referencedUris = yield* select(itwStatusListReferencedUrisSelector);
  const cached = yield* call(StatusListRepository.list);

  const uniqueRefs = new Set(referencedUris);

  // Remove unreferenced: cached but not referenced by any owner
  const unreferenced = cached
    .map(payload => payload.sub)
    .filter(uri => !uniqueRefs.has(uri));

  if (unreferenced.length > 0) {
    yield* call(StatusListRepository.removeMany, unreferenced);
  }
}
