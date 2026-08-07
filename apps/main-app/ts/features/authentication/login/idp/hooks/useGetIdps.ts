import { useEffect, useState } from "react";

import { useIOSelector } from "../../../../../store/hooks";
import { convertUnknownToError } from "../../../../../utils/errors";
import { oneIdentityIdpsUrlSelector } from "../../../common/store/selectors/remoteConfig";
import {
  createRetriableFetch,
  unwrapFetchResponse
} from "../../../common/utils/fetch";
import { Idps, IdpsSchema } from "../types/idps";

const fetchIdps = createRetriableFetch();

export type IdpsState =
  | { data: Idps; status: "success" }
  | { error: Error; status: "failure" }
  | { status: "loading" };

export type UseGetIdps = () => {
  state: IdpsState;
};

export const useGetIdps: UseGetIdps = () => {
  const idpsUrl = useIOSelector(oneIdentityIdpsUrlSelector);

  const [state, setState] = useState<IdpsState>({ status: "loading" });

  useEffect(() => {
    setState({ status: "loading" });

    void fetchIdps(idpsUrl)
      .then(unwrapFetchResponse)
      .then(res => res.json())
      .then(IdpsSchema.parse)
      .then(data => setState({ status: "success", data }))
      .catch(e =>
        setState({ status: "failure", error: convertUnknownToError(e) })
      );
  }, [idpsUrl]);

  return {
    state
  };
};
