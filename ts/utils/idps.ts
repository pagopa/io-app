import { SpidIdp } from "../../definitions/content/SpidIdp";
// since this is a test SPID idp, we set isTestIdp flag to avoid rendering.
// It is used has a placeholder to handle taps count on it and open when
// taps count threadshold is reached (see https://www.pivotaltracker.com/story/show/172082895)

export const testIdp: SpidIdp = {
  id: "test",
  name: "Test",
  logo:
    "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/spid/idps/spid.png",
  profileUrl: "",
  isTestIdp: true
};

export const idps: ReadonlyArray<SpidIdp> = [
  {
    id: "arubaid",
    name: "Aruba",
    logo:
      "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/spid/idps/spid-idp-arubaid.png",
    profileUrl: "http://selfcarespid.aruba.it"
  },
  {
    id: "infocertid",
    name: "Infocert",
    logo:
      "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/spid/idps/spid-idp-infocertid.png",
    profileUrl: "https://my.infocert.it/selfcare"
  },
  {
    id: "intesaid",
    name: "Intesa",
    logo:
      "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/spid/idps/spid-idp-intesaid.png",
    profileUrl: "https://spid.intesa.it"
  },
  {
    id: "lepidaid",
    name: "Lepida",
    logo:
      "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/spid/idps/spid-idp-lepidaid.png",
    profileUrl: "https://id.lepida.it/"
  },
  {
    id: "namirialid",
    name: "Namirial",
    logo:
      "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/spid/idps/spid-idp-namirialid.png",
    profileUrl: "https://idp.namirialtsp.com/idp"
  },
  {
    id: "posteid",
    name: "Poste",
    logo:
      "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/spid/idps/spid-idp-posteid.png",
    profileUrl: "https://posteid.poste.it/private/cruscotto.shtml"
  },
  {
    id: "sielteid",
    name: "Sielte",
    logo:
      "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/spid/idps/spid-idp-sielteid.png",
    profileUrl: "https://myid.sieltecloud.it/profile/"
  },
  {
    id: "spiditalia",
    name: "SPIDItalia Register.it",
    logo:
      "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/spid/idps/spid-idp-spiditalia.png",
    profileUrl: "https://spid.register.it"
  },
  {
    id: "timid",
    name: "Telecom Italia",
    logo:
      "https://raw.githubusercontent.com/pagopa/io-services-metadata/master/spid/idps/spid-idp-timid.png",
    profileUrl: "https://id.tim.it/identity/private/"
  }
];
