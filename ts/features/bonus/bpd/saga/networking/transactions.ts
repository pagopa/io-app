import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { CircuitType } from "../../store/actions/transactions";

/**
 * convert a network circuit into the relative app domain model
 * TODO we don't know which values circuit type could have
 * see https://docs.google.com/document/d/1LNbuPEeqyyt9fsJ8yAOOLQG1xLERO6nOdtlnG95cj74/edit#bookmark=id.nzho5vra0820
 */
const mapNetworkCircuitType: Map<string, CircuitType> = new Map<
  string,
  CircuitType
>([
  ["00", "PagoBancomat"],
  ["01", "Visa"],
  ["02", "Mastercard / Maestro"],
  ["03", "Amex"],
  ["04", "JCB"],
  ["05", "UnionPay"],
  ["06", "Diners"],
  ["07", "PostePay"],
  ["08", "BancomatPay"],
  ["09", "Satispay"],
  ["10", "Private"]
]);

export const convertCircuitTypeCode = (code: string): CircuitType =>
  pipe(
    mapNetworkCircuitType.get(code),
    O.fromNullable,
    O.getOrElse(() => "Unknown" as CircuitType)
  );
