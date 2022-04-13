import { Tuple2 } from "italia-ts-commons/lib/tuples";
import { none, some } from "fp-ts/lib/Option";
import {
  getInternalRoute,
  IO_INTERNAL_LINK_PREFIX,
  testableALLOWED_ROUTE_NAMES
} from "../../components/ui/Markdown/handlers/internalLink";

describe("getInternalRoute", () => {
  const allowedRoutes = testableALLOWED_ROUTE_NAMES!.map(r =>
    Tuple2(`${IO_INTERNAL_LINK_PREFIX}${r}`, some({ routeName: r }))
  );
  const validRoute = testableALLOWED_ROUTE_NAMES![0];
  it("should recognize a valid internal route", () => {
    [
      ...allowedRoutes,
      Tuple2("", none),
      Tuple2("  some noise  ", none),
      Tuple2(allowedRoutes[0].e1 + "suffix", none),
      Tuple2(
        IO_INTERNAL_LINK_PREFIX + validRoute + "?param1=value1&param2=value2",
        some({
          routeName: validRoute,
          params: {
            param1: "value1",
            param2: "value2"
          }
        })
      ),
      Tuple2(
        IO_INTERNAL_LINK_PREFIX + validRoute + "?param1=&param2=value2",
        some({
          routeName: validRoute,
          params: {
            param1: "",
            param2: "value2"
          }
        })
      )
    ].forEach(tuple => {
      expect(getInternalRoute(tuple.e1)).toEqual(tuple.e2);
    });
  });
});
