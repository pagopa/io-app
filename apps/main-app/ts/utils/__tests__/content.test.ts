import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";

import { Locales, setLocale } from "../../i18n";
import {
  getContextualHelpDataFromRouteSelector,
  screenContextualHelpDataSelector
} from "../../store/reducers/content";

const chData = {
  version: 1,
  it: {
    screens: [
      {
        route_name: "AUTHENTICATION_IDP_LOGIN",
        title: "title IT",
        content: "**content IT**"
      }
    ],
    idps: {
      arubaid: {
        description:
          "Se riscontri altri problemi nella procedura di autenticazione, puoi contattare il servizio dedicato offerto da Aruba selezionando una delle opzioni disponibili qui.",
        helpdesk_form:
          "https://selfcarespid.aruba.it/#/recovery-emergency-code",
        phone: "003905750504",
        web_site: "https://www.pec.it/richiedi-spid-aruba-id.aspx",
        recover_username: "https://selfcarespid.aruba.it/#/yyyy",

        recover_password: "https://selfcarespid.aruba.it/#/xxxx",
        recover_emergency_code:
          "https://selfcarespid.aruba.it/#/recovery-emergency-code"
      },
      cie: {
        description: "DESCRIPTION IT",
        helpdesk_form:
          "https://selfcarespid.aruba.it/#/recovery-emergency-code",
        phone: "PHONE IT",
        web_site: "https://www.pec.it/richiedi-spid-aruba-id.aspx",
        recover_username: "https://selfcarespid.aruba.it/#/yyyy",

        recover_password: "https://selfcarespid.aruba.it/#/xxxx",
        recover_emergency_code:
          "https://selfcarespid.aruba.it/#/recovery-emergency-code"
      }
    }
  },
  en: {
    screens: [
      {
        route_name: "AUTHENTICATION_IDP_LOGIN",
        title: "title EN",
        content: "**content EN**"
      }
    ],
    idps: {
      timid: {
        description:
          "For problems encountered during the authentication process , you can reach the support desk of Aruba by selecting  one of the options presented below.",
        helpdesk_form:
          "https://selfcarespid.aruba.it/#/recovery-emergency-code",
        phone: "003905750504",
        web_site: "https://www.pec.it/richiedi-spid-aruba-id.aspx",
        recover_username: "https://selfcarespid.aruba.it/#/yyyyy",

        recover_password: "https://selfcarespid.aruba.it/#/xxxxx",
        recover_emergency_code:
          "https://selfcarespid.aruba.it/#/recovery-emergency-code"
      },

      cie: {
        description: "DESCRIPTION EN",
        helpdesk_form:
          "https://selfcarespid.aruba.it/#/recovery-emergency-code",
        phone: "PHONE EN",
        web_site: "https://www.pec.it/richiedi-spid-aruba-id.aspx",
        recover_username: "https://selfcarespid.aruba.it/#/yyyy",

        recover_password: "https://selfcarespid.aruba.it/#/xxxx",
        recover_emergency_code:
          "https://selfcarespid.aruba.it/#/recovery-emergency-code"
      }
    }
  }
};
// test "it" as default language
beforeAll(() => setLocale("it" as Locales));

describe("screenContextualHelpDataSelector", () => {
  it("should return no data if navigation state is empty", async () => {
    const screenData = screenContextualHelpDataSelector.resultFunc(
      pot.some(chData),
      ""
    );
    expect(pot.isSome(screenData) && O.isNone(screenData.value)).toBeTruthy();
  });

  it("should return data (italian) if the current screen is present as key", async () => {
    setLocale("it" as Locales);
    assertScreenValues("title IT", "**content IT**");
  });

  it("should return data (english) if the current screen is present as key", async () => {
    setLocale("en" as Locales);
    assertScreenValues("title EN", "**content EN**");
  });

  it("should return data (italian) if the current screen is present as key and the set language is not supported", async () => {
    setLocale("br" as Locales);
    assertScreenValues("title IT", "**content IT**");
  });

  const assertScreenValues = (title: string, content: string) => {
    const screenData = screenContextualHelpDataSelector.resultFunc(
      pot.some(chData),
      "AUTHENTICATION_IDP_LOGIN"
    );
    if (pot.isSome(screenData) && O.isSome(screenData.value)) {
      expect(screenData.value.value.title).toEqual(title);
      expect(screenData.value.value.content).toEqual(content);
    }
  };

  it("should return no data if the current screen is not present as key", async () => {
    const screenData = screenContextualHelpDataSelector.resultFunc(
      pot.some(chData),
      "NO_KEY"
    );
    expect(pot.isSome(screenData) && O.isNone(screenData.value)).toBeTruthy();
  });
});

describe("getContextualHelpDataFromRouteSelector", () => {
  it("should return no data if route is empty", async () => {
    const screenData = getContextualHelpDataFromRouteSelector("").resultFunc(
      pot.some(chData)
    );
    expect(pot.isSome(screenData) && !screenData.value).toBeTruthy();
  });

  it("should return data (italian) if the route is present as key", async () => {
    setLocale("it" as Locales);
    assertRouteValues("title IT", "**content IT**");
  });

  it("should return data (english) if the route is present as key", async () => {
    setLocale("en" as Locales);
    assertRouteValues("title EN", "**content EN**");
  });

  it("should return data (italian) if the route is present as key and the set language is not supported", async () => {
    setLocale("br" as Locales);
    assertRouteValues("title IT", "**content IT**");
  });

  const assertRouteValues = (title: string, content: string) => {
    const screenData = getContextualHelpDataFromRouteSelector(
      "AUTHENTICATION_IDP_LOGIN"
    ).resultFunc(pot.some(chData));
    if (pot.isSome(screenData) && screenData.value) {
      expect(screenData.value.title).toEqual(title);
      expect(screenData.value.content).toEqual(content);
    }
  };

  it("should return no data if the route is not present as key", async () => {
    const screenData = getContextualHelpDataFromRouteSelector(
      "NO_KEY"
    ).resultFunc(pot.some(chData));
    expect(pot.isSome(screenData) && !screenData.value).toBeTruthy();
  });
});
