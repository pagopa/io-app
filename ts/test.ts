import * as t from "io-ts";
import { Amount } from "./types/pagopa";

const a: Amount = Amount.decode({
  amount: 13
}).getOrElse({ amount: -1 });
