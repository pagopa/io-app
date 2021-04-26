import {
  findAllUsingGETDefaultDecoder,
  FindAllUsingGETT
} from "../../../../../../definitions/bpd/award_periods/requestTypes";
import { bpdHeadersProducers } from "../common";

export const awardPeriodsGET: FindAllUsingGETT = {
  method: "get",
  url: () => `/bpd/io/award-periods`,
  query: _ => ({}),
  headers: bpdHeadersProducers(),
  response_decoder: findAllUsingGETDefaultDecoder()
};
