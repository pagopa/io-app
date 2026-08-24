import { useEffect, useState } from "react";

import { useIOSelector } from "../../../../../store/hooks";
import { oneIdentityIdpsUrlSelector } from "../../../common/store/selectors/remoteConfig";
import { createRetriableFetch } from "../../../common/utils/fetch";
import { jsonFetchToSchema } from "../../../common/utils/jsonFetchToSchema";
import { Idps, IdpsSchema } from "../types/idps";

const fetchIdps = createRetriableFetch();

export type IdpsState =
  | { data: Idps; status: "success" }
  | { error: string; status: "failure" }
  | { status: "loading" };

export type UseGetIdps = () => {
  state: IdpsState;
};

export const useGetIdps: UseGetIdps = () => {
  const idpsUrl = useIOSelector(oneIdentityIdpsUrlSelector);

  const [state, setState] = useState<IdpsState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    const fetchIdpList = async () => {
      const requestPromise = fetchIdps(idpsUrl, { signal: controller.signal });
      const result = await jsonFetchToSchema(requestPromise, IdpsSchema);

      if (!result.ok) {
        setState({ status: "failure", error: result.error });
        return;
      }
      setState({ status: "success", data: result.data });
    };
    void fetchIdpList();

    return () => controller.abort();
  }, [idpsUrl]);

  return {
    state
  };
};
