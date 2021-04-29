import { IdpEntry } from "../../../../definitions/content/IdpEntry";

// since this is a test SPID idp, we set isTestIdp flag to avoid rendering.
// It is used has a placeholder to handle taps count on it and open when
// taps count threadshold is reached (see https://www.pivotaltracker.com/story/show/172082895)
export const testIdp: IdpEntry = {
  id: "test",
  name: "Test",
  logo:
    "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/spid/idps/spid.png",
  entityID: "test-login",
  profileUrl: "",
  isTestIdp: true
};

export const idps: ReadonlyArray<IdpEntry> = [
  {
    id: "arubaid",
    name: "Aruba",
    logo:
      "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/spid/idps/spid-idp-arubaid.png",
    entityID: "arubaid",
    profileUrl: "http://selfcarespid.aruba.it"
  },
  {
    id: "infocertid",
    name: "Infocert",
    logo:
      "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/spid/idps/spid-idp-infocertid.png",
    entityID: "infocertid",
    profileUrl: "https://my.infocert.it/selfcare"
  },
  {
    id: "intesaid",
    name: "Intesa",
    logo:
      "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/spid/idps/spid-idp-intesaid.png",
    entityID: "intesaid",
    profileUrl: "https://spid.intesa.it"
  },
  {
    id: "lepidaid",
    name: "Lepida",
    logo:
      "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/spid/idps/spid-idp-lepidaid.png",
    entityID: "lepidaid",
    profileUrl: "https://id.lepida.it/"
  },
  {
    id: "namirialid",
    name: "Namirial",
    logo:
      "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/spid/idps/spid-idp-namirialid.png",
    entityID: "namirialid",
    profileUrl: "https://idp.namirialtsp.com/idp"
  },
  {
    id: "posteid",
    name: "Poste",
    logo:
      "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/spid/idps/spid-idp-posteid.png",
    entityID: "posteid",
    profileUrl: "https://posteid.poste.it/private/cruscotto.shtml"
  },
  {
    id: "sielteid",
    name: "Sielte",
    logo:
      "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/spid/idps/spid-idp-sielteid.png",
    entityID: "sielteid",
    profileUrl: "https://myid.sieltecloud.it/profile/"
  },
  {
    id: "spiditalia",
    name: "SPIDItalia Register.it",
    logo:
      "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/spid/idps/spid-idp-spiditalia.png",
    entityID: "spiditalia",
    profileUrl: "https://spid.register.it"
  },
  {
    id: "timid",
    name: "Telecom Italia",
    logo:
      "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/spid/idps/spid-idp-timid.png",
    entityID: "timid",
    profileUrl: "https://id.tim.it/identity/private/"
  }
];
