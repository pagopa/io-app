import { SpidIdp } from "../../definitions/content/SpidIdp";

export const idps: ReadonlyArray<SpidIdp> = [
  {
    id: "arubaid",
    name: "Aruba ID",
    logo: require("../../img/spid-idp-arubaid.png"),
    profileUrl: "https://selfcarespid.aruba.it"
  },
  {
    id: "ehtid",
    name: "Etna ID",
    logo: require("../../img/spid-idp-etnaid.png"),
    profileUrl: "https://etnaid.eht.eu/"
  },
  {
    id: "infocamereid",
    name: "ID InfoCamere",
    logo: require("../../img/spid-idp-infocamereid.png"),
    profileUrl: "https://selfcarespid.infocamere.it/spid-selfCare/#/login"
  },
  {
    id: "infocertid",
    name: "InfoCert ID",
    logo: require("../../img/spid-idp-infocertid.png"),
    profileUrl: "https://my.infocert.it/selfcare"
  },
  {
    id: "intesiid",
    name: "Intesi Group SPID",
    logo: require("../../img/spid-idp-intesigroupspid.png"),
    profileUrl: "https://spid.intesigroup.com"
  },
  {
    id: "lepidaid",
    name: "Lepida ID",
    logo: require("../../img/spid-idp-lepidaid.png"),
    profileUrl: "https://id.lepida.it/"
  },
  {
    id: "namirialid",
    name: "Namirial ID",
    logo: require("../../img/spid-idp-namirialid.png"),
    profileUrl: "https://idp.namirialtsp.com/idp"
  },
  {
    id: "posteid",
    name: "Poste ID",
    logo: require("../../img/spid-idp-posteid.png"),
    profileUrl: "https://posteid.poste.it/private/cruscotto.shtml"
  },
  {
    id: "sielteid",
    name: "Sielte ID",
    logo: require("../../img/spid-idp-sielteid.png"),
    profileUrl: "https://myid.sieltecloud.it/profile/"
  },
  {
    id: "spiditalia",
    name: "SpidItalia",
    logo: require("../../img/spid-idp-spiditalia.png"),
    profileUrl: "https://spid.register.it"
  },
  {
    id: "timid",
    name: "TIM id",
    logo: require("../../img/spid-idp-timid.png"),
    profileUrl: "https://id.tim.it/identity/private/"
  },
  {
    id: "teamsystemid",
    name: "TeamSystem ID",
    logo: require("../../img/spid-idp-teamsystemid.png"),
    profileUrl: "https://identity.teamsystem.com/"
  }
];
