import { all, call, put, select } from "typed-redux-saga/macro";

import { getIoWallet } from "../../common/utils/itwIoWallet";
import {
  CredentialMetadata,
  CredentialValidity
} from "../../common/utils/itwTypesUtils";
import { itwCredentialsStore } from "../../credentials/store/actions";
import { itwAllStoredCredentialsSelector } from "../../credentials/store/selectors";
import { StatusListRepository } from "../utils/repository";
import { StatusListContext } from "../utils/types";

const hasStatusListValidity = (
  credential: CredentialMetadata
): credential is CredentialMetadata & { validity: CredentialValidity } =>
  credential.validity?.type === "status_list";

/**
 * Updates the validity of credentials whose status list is available in the cache.
 */
export function* updateCredentialsStatusSaga({
  itwVersion
}: StatusListContext) {
  const statusListApi = getIoWallet(itwVersion).CredentialStatus.statusList;
  if (!statusListApi.isSupported) {
    return;
  }

  const allCredentials = yield* select(itwAllStoredCredentialsSelector);
  const credentials = allCredentials.filter(hasStatusListValidity);

  const statusLists = yield* all(
    credentials.map(({ validity }) =>
      call(StatusListRepository.get, validity.statusList.uri)
    )
  );
  const updatedCredentials = credentials.flatMap((credential, index) => {
    const statusList = statusLists[index];
    if (!statusList) {
      return [];
    }

    const { status, rawStatus } = statusListApi.getStatus(
      statusList.status_list,
      credential.validity.statusList.idx
    );
    const nextValidity = {
      ...credential.validity,
      rawStatus,
      status: status.toLowerCase()
    };

    return nextValidity.status !== credential.validity.status ||
      nextValidity.rawStatus !== credential.validity.rawStatus
      ? [{ ...credential, validity: nextValidity }]
      : [];
  });

  if (updatedCredentials.length > 0) {
    yield* put(itwCredentialsStore(updatedCredentials));
  }
}
