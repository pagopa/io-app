import { ImageSourcePropType } from "react-native";
import { SpidIdp } from "../../definitions/content/SpidIdp";
// since this is a test SPID idp, we set isTestIdp flag to avoid rendering.
// It is used has a placeholder to handle taps count on it and open when
// taps count threadshold is reached (see https://www.pivotaltracker.com/story/show/172082895)

export type LocalIdpsFallback = SpidIdp & { localLogo?: ImageSourcePropType };

export const idps: ReadonlyArray<LocalIdpsFallback> = [
  {
    id: "arubaid",
    name: "Aruba ID",
    localLogo: require("../../img/spid-idp-arubaid.png"),
    logo: "",
    profileUrl: "https://selfcarespid.aruba.it"
  },
  {
    id: "ehtid",
    name: "Etna ID",
    logo: "",
    localLogo: require("../../img/spid-idp-etnaid.png"),
    profileUrl: "https://etnaid.eht.eu/"
  },
  {
    id: "infocamereid",
    name: "ID InfoCamere",
    logo: "",
    localLogo: require("../../img/spid-idp-infocamereid.png"),
    profileUrl: "https://selfcarespid.infocamere.it/spid-selfCare/#/login"
  },
  {
    id: "infocertid",
    name: "InfoCert ID",
    logo: "",
    localLogo: require("../../img/spid-idp-infocertid.png"),
    profileUrl: "https://my.infocert.it/selfcare"
  },
  {
    id: "intesiid",
    name: "Intesi Group SPID",
    logo: "",
    localLogo: require("../../img/spid-idp-intesigroupspid.png"),
    profileUrl: "https://spid.intesigroup.com"
  },
  {
    id: "lepidaid",
    name: "Lepida ID",
    logo: "",
    localLogo: require("../../img/spid-idp-lepidaid.png"),
    profileUrl: "https://id.lepida.it/"
  },
  {
    id: "namirialid",
    name: "Namirial ID",
    logo: "",
    localLogo: require("../../img/spid-idp-namirialid.png"),
    profileUrl: "https://idp.namirialtsp.com/idp"
  },
  {
    id: "posteid",
    name: "Poste ID",
    logo: "",
    localLogo: require("../../img/spid-idp-posteid.png"),
    profileUrl: "https://posteid.poste.it/private/cruscotto.shtml"
  },
  {
    id: "sielteid",
    name: "Sielte ID",
    logo: "",
    localLogo: require("../../img/spid-idp-sielteid.png"),
    profileUrl: "https://myid.sieltecloud.it/profile/"
  },
  {
    id: "spiditalia",
    name: "SpidItalia",
    logo: "",
    localLogo: require("../../img/spid-idp-spiditalia.png"),
    profileUrl: "https://spid.register.it"
  },
  {
    id: "timid",
    name: "TIM id",
    logo: "",
    localLogo: require("../../img/spid-idp-timid.png"),
    profileUrl: "https://id.tim.it/identity/private/"
  },
  {
    id: "teamsystemid",
    name: "TeamSystem ID",
    logo: "",
    localLogo: require("../../img/spid-idp-teamsystemid.png"),
    profileUrl: "https://identity.teamsystem.com/"
  }
];
