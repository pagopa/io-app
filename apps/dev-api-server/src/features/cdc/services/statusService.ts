import { Either, left, right } from "fp-ts/lib/Either";

import { CitizenStatus } from "../../../../generated/definitions/cdc/CitizenStatus";
import { ioDevServerConfig } from "../../../config";
import { getProblemJson } from "../../../payloads/error";
import { ExpressFailure } from "../../../utils/expressDTO";
import { CDC_CURRENT_STATUS } from "../persistence";

export const getCdcStatus = (): Either<ExpressFailure, CitizenStatus> => {
  if (ioDevServerConfig.features.bonus.cdc.enabled) {
    return right(CDC_CURRENT_STATUS);
  }
  return left({
    httpStatusCode: 404,
    reason: getProblemJson(404, "Not found", "CDC is not enabled")
  });
};
