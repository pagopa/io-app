import { ImageSourcePropType } from "react-native";
import { SpidIdp as GeneratedSpidIdpType } from "../../definitions/content/SpidIdp";

export const fromGeneratedToLocalSpidIdp = (
  idps: ReadonlyArray<GeneratedSpidIdpType>
): ReadonlyArray<SpidIdp> =>
  idps.map(idp => ({
    id: idp.id,
    name: idp.name,
    logo: {
      light: { uri: idp.logo },
      ...(idp.logoDark ? { dark: { uri: idp.logoDark } } : {})
    },
    profileUrl: idp.profileUrl,
    isTestIdp: idp.isTestIdp
  }));

export type SpidIdp = Omit<GeneratedSpidIdpType, "logo"> & {
  logo: {
    light: ImageSourcePropType;
    dark?: ImageSourcePropType;
  };
};

export const idps: ReadonlyArray<SpidIdp> = [
  {
    id: "arubaid",
    name: "Aruba ID",
    logo: {
      light: require("../../img/spid-idp-arubaid.png")
    },
    profileUrl: "https://selfcarespid.aruba.it"
  },
  {
    id: "ehtid",
    name: "Etna ID",
    logo: {
      light: require("../../img/spid-idp-etnaid.png"),
      dark: require("../../img/spid-idp-etnaid-dark.png")
    },
    profileUrl: "https://etnaid.eht.eu/"
  },
  {
    id: "infocamereid",
    name: "ID InfoCamere",
    logo: {
      light: require("../../img/spid-idp-infocamereid.png")
    },
    profileUrl: "https://selfcarespid.infocamere.it/spid-selfCare/#/login"
  },
  {
    id: "infocertid",
    name: "InfoCert ID",
    logo: {
      light: require("../../img/spid-idp-infocertid.png"),
      dark: require("../../img/spid-idp-infocertid-dark.png")
    },
    profileUrl: "https://my.infocert.it/selfcare"
  },
  {
    id: "intesiid",
    name: "Intesi Group SPID",
    logo: {
      light: require("../../img/spid-idp-intesigroupspid.png"),
      dark: require("../../img/spid-idp-intesigroupspid-dark.png")
    },
    profileUrl: "https://spid.intesigroup.com"
  },
  {
    id: "lepidaid",
    name: "Lepida ID",
    logo: {
      light: require("../../img/spid-idp-lepidaid.png"),
      dark: require("../../img/spid-idp-lepidaid-dark.png")
    },
    profileUrl: "https://id.lepida.it/"
  },
  {
    id: "namirialid",
    name: "Namirial ID",
    logo: {
      light: require("../../img/spid-idp-namirialid.png"),
      dark: require("../../img/spid-idp-namirialid-dark.png")
    },
    profileUrl: "https://idp.namirialtsp.com/idp"
  },
  {
    id: "posteid",
    name: "Poste ID",
    logo: {
      light: require("../../img/spid-idp-posteid.png"),
      dark: require("../../img/spid-idp-posteid-dark.png")
    },
    profileUrl: "https://posteid.poste.it/private/cruscotto.shtml"
  },
  {
    id: "sielteid",
    name: "Sielte ID",
    logo: {
      light: require("../../img/spid-idp-sielteid.png"),
      dark: require("../../img/spid-idp-sielteid-dark.png")
    },
    profileUrl: "https://myid.sieltecloud.it/profile/"
  },
  {
    id: "spiditalia",
    name: "SpidItalia",
    logo: {
      light: require("../../img/spid-idp-spiditalia.png"),
      dark: require("../../img/spid-idp-spiditalia-dark.png")
    },
    profileUrl: "https://spid.register.it"
  },
  {
    id: "timid",
    name: "TIM id",
    logo: {
      light: require("../../img/spid-idp-timid.png")
    },
    profileUrl: "https://id.tim.it/identity/private/"
  },
  {
    id: "teamsystemid",
    name: "TeamSystem ID",
    logo: {
      light: require("../../img/spid-idp-teamsystemid.png")
    },
    profileUrl: "https://identity.teamsystem.com/"
  }
];
