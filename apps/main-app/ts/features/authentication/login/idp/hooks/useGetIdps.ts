import { useEffect, useState } from "react";

import { useIOSelector } from "../../../../../store/hooks";
import {
  oneIdentityIdpFriendlyNamesUrlSelector,
  oneIdentityIdpsUrlSelector
} from "../../../common/store/selectors/remoteConfig";
import { createRetriableFetch } from "../../../common/utils/fetch";
import { jsonFetchToSchema } from "../../../common/utils/jsonFetchToSchema";
import { IdpFriendlyNamesSchema, Idps, IdpsSchema } from "../types/idps";

const fetch = createRetriableFetch();

export type IdpsState =
  | { data: Idps; status: "success" }
  | { error: string; status: "failure" }
  | { status: "loading" };

export type UseGetIdps = () => {
  state: IdpsState;
};

export const useGetIdps: UseGetIdps = () => {
  const idpsUrl = useIOSelector(oneIdentityIdpsUrlSelector);
  const idpFriendlyNamesUrl = useIOSelector(
    oneIdentityIdpFriendlyNamesUrlSelector
  );

  const [state, setState] = useState<IdpsState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    const fetchIdpList = async () => {
      const idpsPromise = jsonFetchToSchema(
        fetch(idpsUrl, { signal: controller.signal }),
        IdpsSchema
      );
      const idpFriendlyNamesPromise = jsonFetchToSchema(
        fetch(idpFriendlyNamesUrl, { signal: controller.signal }),
        IdpFriendlyNamesSchema
      );

      const [idpsResult, idpFriendlyNamesResult] = await Promise.all([
        idpsPromise,
        idpFriendlyNamesPromise
      ]);

      if (idpsResult.isErr()) {
        return setState({ status: "failure", error: idpsResult.error });
      }

      const idpFriendlyNamesMap = idpFriendlyNamesResult.isOk()
        ? idpFriendlyNamesResult.value
        : {};

      setState({
        status: "success",
        data: idpsResult.value.map(idp => ({
          ...idp,
          friendlyName: idpFriendlyNamesMap[idp.entityID] ?? idp.friendlyName
        }))
      });
    };
    void fetchIdpList();

    return () => controller.abort();
  }, [idpFriendlyNamesUrl, idpsUrl]);

  return {
    state
  };
};
