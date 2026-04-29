import { Tuple2 } from "@pagopa/ts-commons/lib/tuples";
import {
  getInternalRoute,
  isServiceDetailNavigationLink,
  testableALLOWED_ROUTE_NAMES
} from "../internalLink";
import {
  IO_INTERNAL_LINK_PREFIX,
  IO_UNIVERSAL_LINK_PREFIX
} from "../navigation";
import { IO_FIMS_LINK_PREFIX } from "../../features/fims/singleSignOn/utils";

describe("getInternalRoute", () => {
  const allowedRoutes = Object.entries(testableALLOWED_ROUTE_NAMES!).map(
    ([r, v]) => Tuple2(`${IO_INTERNAL_LINK_PREFIX}${r}`, v)
  );
  const validRoute = Object.keys(testableALLOWED_ROUTE_NAMES!)[0];
  it("should recognize a valid internal route", () => {
    [
      ...allowedRoutes,
      Tuple2("", ""),
      Tuple2("  some noise  ", "  some noise  "),
      Tuple2(
        allowedRoutes[0].e1 + "suffix",
        allowedRoutes[0].e1.replace(IO_INTERNAL_LINK_PREFIX, "/") + "suffix"
      ),
      Tuple2(
        IO_INTERNAL_LINK_PREFIX + validRoute + "?param1=value1&param2=value2",
        `${
          testableALLOWED_ROUTE_NAMES![validRoute]
        }?param1=value1&param2=value2`
      ),
      Tuple2(
        IO_INTERNAL_LINK_PREFIX + validRoute + "?param1=&param2=value2",
        `${testableALLOWED_ROUTE_NAMES![validRoute]}?param1=&param2=value2`
      ),
      Tuple2(IO_FIMS_LINK_PREFIX + "just/a/test", "/just/a/test"),
      Tuple2(IO_UNIVERSAL_LINK_PREFIX + "just/a/test", "/just/a/test"),
      Tuple2(
        IO_FIMS_LINK_PREFIX + "just/a/test?param1=&param2=value2",
        "/just/a/test?param1=&param2=value2"
      ),
      Tuple2(
        IO_UNIVERSAL_LINK_PREFIX + "just/a/test?param1=&param2=value2",
        "/just/a/test?param1=&param2=value2"
      )
    ].forEach(tuple => {
      expect(getInternalRoute(tuple.e1)).toEqual(tuple.e2);
    });
  });
});

describe("getInternalRoute - credential offer normalization", () => {
  it.each([
    {
      name: "openid-credential-offer custom scheme",
      href: "openid-credential-offer://?credential_offer=%7B%22credential_issuer%22%3A%22https%3A%2F%2Fissuer%22%7D"
    },
    {
      name: "haip-vci custom scheme",
      href: "haip-vci://?credential_offer_uri=https%3A%2F%2Fissuer%2Foffer"
    },
    {
      name: "io universal link with credential_offer query param",
      href: `${IO_UNIVERSAL_LINK_PREFIX}/itw/credential-offer?credential_offer=abc`
    },
    {
      name: "io universal link with credential_offer_uri query param",
      href: `${IO_UNIVERSAL_LINK_PREFIX}/itw/credential-offer?credential_offer_uri=https%3A%2F%2Fissuer%2Foffer`
    }
  ])(
    "wraps $name into ioit://itw/credential-offer preserving the original URI as itwCredentialOfferUri",
    ({ href }) => {
      const result = getInternalRoute(href);
      const prefix = `${IO_INTERNAL_LINK_PREFIX}itw/credential-offer?itwCredentialOfferUri=`;
      expect(result.startsWith(prefix)).toBe(true);

      const encoded = result.slice(prefix.length);
      expect(decodeURIComponent(encoded)).toBe(href);
    }
  );

  it("does not wrap URLs that are not credential offer invocations", () => {
    const href = "https://example.com/some/page";
    expect(getInternalRoute(href)).not.toContain("itw/credential-offer");
  });
});

describe("isServiceDetailNavigationLink", () => {
  [
    {
      link: "ioit://services/service-detail",
      testDescription: "Base ioit://services/service-detail link should match",
      output: true
    },
    {
      link: "iOiT://sErViCeS/sErViCe-dEtAiL",
      testDescription:
        "Case sensitive iOiT://sErViCeS/sErViCe-dEtAiL link should match",
      output: true
    },
    {
      link: "https://continua.io.pagopa.it/services/service-detail",
      testDescription:
        "Base https://continua.io.pagopa.it/services/service-detail link should match",
      output: true
    },
    {
      link: "hTTpS://cOnTiNuA.iO.pAgOpA.iT/sErViCeS/sErViCe-dEtAiL",
      testDescription:
        "Case sensitive hTTpS://cOnTiNuA.iO.pAgOpA.iT/sErViCeS/sErViCe-dEtAiL link should match",
      output: true
    },
    {
      link: "ioit://services/service-detail?serviceId=7h8fs7fdh98sd9f8h9",
      testDescription:
        "Base ioit://services/service-detail link with query string parameter should match",
      output: true
    },
    {
      link: "iOiT://sErViCeS/sErViCe-dEtAiL?seRviCeId=7h8fS7fdh98SD9f8h9",
      testDescription:
        "Case sensitive iOiT://sErViCeS/sErViCe-dEtAiL link with case sensitive string parameter should match",
      output: true
    },
    {
      link: "https://continua.io.pagopa.it/services/service-detail?serviceId=7h8fs7fdh98sd9f8h9",
      testDescription:
        "Base https://continua.io.pagopa.it/services/service-detail link with query string parameter should match",
      output: true
    },
    {
      link: "hTTpS://cOnTiNuA.iO.pAgOpA.iT/sErViCeS/sErViCe-dEtAiL?seRviCeId=7h8fS7fdh98SD9f8h9",
      testDescription:
        "Case sensitive hTTpS://cOnTiNuA.iO.pAgOpA.iT/sErViCeS/sErViCe-dEtAiL link with case sensitive string parameter should match",
      output: true
    },
    {
      link: "",
      testDescription: "Empty string should not match",
      output: false
    },
    {
      link: "main/services",
      testDescription: "main/services should not match",
      output: false
    },
    {
      link: "ioit://",
      testDescription: "ioit:// should not match",
      output: false
    },
    {
      link: "https://continua.io.pagopa.it",
      testDescription: "hTTpS://cOnTiNuA.iO.pAgOpA.iT should not match",
      output: false
    },
    {
      link: "iosso://services/service-detail",
      testDescription: "iosso://main/services should not match",
      output: false
    }
  ].forEach(({ link, testDescription, output }) =>
    it(testDescription, () => {
      const serviceLinkIncluded = isServiceDetailNavigationLink(link);
      expect(serviceLinkIncluded).toBe(output);
    })
  );
});
