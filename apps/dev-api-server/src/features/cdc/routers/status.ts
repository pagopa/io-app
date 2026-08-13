import { handleLeftEitherIfNeeded } from "../../../utils/error";
import { getCdcStatus } from "../services/statusService";
import { addCdcHandler } from "./router";

addCdcHandler("get", "/status", (_, res) => {
  const statusEither = getCdcStatus();
  if (handleLeftEitherIfNeeded(statusEither, res)) {
    return;
  }
  res.status(200).json(statusEither.right);
});
