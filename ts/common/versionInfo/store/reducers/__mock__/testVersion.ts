import { ITuple3, Tuple3 } from "@pagopa/ts-commons/lib/tuples";

export const minAppVersionAppVersionTestCases: ReadonlyArray<
  ITuple3<string, string, boolean>
> = [
  Tuple3("0.0.0", "6.5.4.3", true),
  Tuple3("1.0.0", "6.5.4.3", true),
  Tuple3("1.100.0", "6.5.4.3", true),
  Tuple3("1.100.1000", "6.5.4.3", true),
  Tuple3("1.1.1.10000", "6.5.4.3", true),
  Tuple3("5.0.0", "6.5.4.3", true),
  Tuple3("6.4.0", "6.5.4.3", true),
  Tuple3("6.5.3", "6.5.4.3", true),
  Tuple3("6.5.4.2", "6.5.4.3", true),

  Tuple3("6.5.4.3", "700000.0.0", true),
  Tuple3("6.5.4.3", "7.1.0", true),
  Tuple3("6.5.4.3", "7.1.1", true),
  Tuple3("6.5.4.3", "7.1.1.0", true),
  Tuple3("6.5.4.3", "7.0.0", true),
  Tuple3("6.5.4.3", "6.6.0", true),
  Tuple3("6.5.4.3", "6.5.5", true),
  Tuple3("6.5.4.3", "6.5.4.4", true),

  Tuple3("6.5.4.3", "6.5.4.3", true),

  Tuple3("7.0.0", "6.5.4.3", false),
  Tuple3("7.4.0", "6.5.4.3", false),
  Tuple3("7.5.5", "6.5.4.3", false),
  Tuple3("7.5.4.4", "6.5.4.3", false),
  Tuple3("6.6.0", "6.5.4.3", false),
  Tuple3("6.5.5", "6.5.4.3", false),
  Tuple3("6.5.4.4", "6.5.4.3", false)
];
