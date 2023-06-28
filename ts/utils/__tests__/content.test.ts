import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { Locales } from "../../../locales/locales";
import { setLocale } from "../../i18n";
import {
  idpContextualHelpDataFromIdSelector,
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
        // eslint-disable-next-line
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
        // eslint-disable-next-line
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
        // eslint-disable-next-line
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
        // eslint-disable-next-line
        recover_password: "https://selfcarespid.aruba.it/#/xxxx",
        recover_emergency_code:
          "https://selfcarespid.aruba.it/#/recovery-emergency-code"
      }
    }
  }
};
// test "it" as default language
beforeAll(() => setLocale("it" as Locales));

describe("idpContextualHelpDataFromIdSelector", () => {
  it("should return data for existing idp", async () => {
    const idpData = idpContextualHelpDataFromIdSelector("arubaid").resultFunc(
      pot.some(chData)
    );
    expect(O.isSome(idpData)).toBeTruthy();
  });

  it("should not return data for not-existing idp", async () => {
    const idpData = idpContextualHelpDataFromIdSelector("timid").resultFunc(
      pot.some(chData)
    );
    expect(O.isNone(idpData)).toBeTruthy();
  });

  it("should not return data is store is empty", async () => {
    const idpData = idpContextualHelpDataFromIdSelector("timid").resultFunc(
      pot.none
    );
    expect(O.isNone(idpData)).toBeTruthy();
  });

  it("should not return data is store is in error & empty", async () => {
    const idpData = idpContextualHelpDataFromIdSelector("timid").resultFunc(
      pot.noneError(new Error())
    );
    expect(O.isNone(idpData)).toBeTruthy();
  });

  it("should return data is store is in error with value", async () => {
    const idpData = idpContextualHelpDataFromIdSelector("arubaid").resultFunc(
      pot.someError(chData, new Error())
    );
    expect(O.isSome(idpData)).toBeTruthy();
  });

  it("should not return data if it's not available for the set language", async () => {
    setLocale("en" as Locales);
    const idpData = idpContextualHelpDataFromIdSelector("arubaid").resultFunc(
      pot.some(chData)
    );
    setLocale("it" as Locales); // restore default
    expect(O.isNone(idpData)).toBeTruthy();
  });

  it("should return data for the set language (it)", async () => {
    assertIdpValues("DESCRIPTION IT", "PHONE IT");
  });

  it("should return data for the set language (en)", async () => {
    setLocale("en" as Locales);
    assertIdpValues("DESCRIPTION EN", "PHONE EN");
  });

  it("should return fallback data if the set language is not rupported", async () => {
    setLocale("de" as Locales);
    assertIdpValues("DESCRIPTION EN", "PHONE EN");
  });

  const assertIdpValues = (description: string, phone: string) => {
    const idpData = idpContextualHelpDataFromIdSelector("cie").resultFunc(
      pot.some(chData)
    );
    expect(O.isSome(idpData)).toBeTruthy();
    if (O.isSome(idpData)) {
      expect(idpData.value.description).toEqual(description);
      expect(idpData.value.phone).toEqual(phone);
    }
  };
});

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

  it("should return data (english) if the current screen is present as key and the set language is not supported", async () => {
    setLocale("br" as Locales);
    assertScreenValues("title EN", "**content EN**");
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
