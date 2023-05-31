import * as React from "react";
import { View, StyleSheet, ImageURISource } from "react-native";
import {
  DSLogoPaymentViewerBox,
  logoItemGutter
} from "../components/DSLogoPaymentViewerBox";
import {
  LogoPayment,
  IOLogoPaymentType,
  IOPaymentLogos,
  LogoPaymentExt,
  IOLogoPaymentExtType,
  IOPaymentExtLogos
} from "../../../components/core/logos";
import { H2 } from "../../../components/core/typography/H2";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { useIOTheme } from "../../../components/core/variables/IOColors";
import Avatar from "../../../components/ui/Avatar";
import { HSpacer, VSpacer } from "../../../components/core/spacer/Spacer";
// Assets
import LogoComuneDiMilano from "../../../../img/utils/logo-entities/1199250158.png";
import LogoComuneDiSottoIlMonte from "../../../../img/utils/logo-entities/82003830161.png";
import LogoComuneDiControguerra from "../../../../img/utils/logo-entities/82001760675.png";
import LogoINPS from "../../../../img/utils/logo-entities/80078750587.png";
import LogoEDistribuzione from "../../../../img/utils/logo-entities/5779711000.png";
import LogoAgenziaDifesa from "../../../../img/utils/logo-entities/97254170588.png";
import LogoMinisteroInterno from "../../../../img/utils/logo-entities/80215430580.png";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";

const styles = StyleSheet.create({
  itemsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: 16,
    marginLeft: (logoItemGutter / 2) * -1,
    marginRight: (logoItemGutter / 2) * -1
  }
});

export const DSLogos = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen title={"Logos"}>
      <H2
        color={theme["textHeading-default"]}
        weight={"SemiBold"}
        style={{ marginBottom: 12 }}
      >
        Avatar
      </H2>
      {renderAvatar()}

      <VSpacer size={24} />

      <H2
        color={theme["textHeading-default"]}
        weight={"SemiBold"}
        style={{ marginBottom: 12 }}
      >
        Payment Networks (Small)
      </H2>
      {renderPaymentLogosSmall()}

      <H2
        color={theme["textHeading-default"]}
        weight={"SemiBold"}
        style={{ marginBottom: 12 }}
      >
        Payment Networks (Big)
      </H2>
      {renderPaymentLogosBig()}
    </DesignSystemScreen>
  );
};

// const cdnPath = "https://assets.cdn.io.italia.it/logos/organizations/";

// const organizationsURIs = [
//   {
//     image: `https://assets.cdn.io.italia.it/logos/organizations/1199250158.png`,
//     name: "Comune di Milano"
//   },
//   {
//     image: "https://assets.cdn.io.italia.it/logos/organizations/2438750586.png",
//     name: "Comune di Roma"
//   },
//   {
//     image: "162210348",
//     name: "Comune di Parma"
//   },
//   {
//     image: "82003830161",
//     name: "Comune di Sotto il Monte Giovanni XXIII"
//   }
// ];

const avatarPaddings = [4, 6, 10];

const renderAvatar = () =>
  avatarPaddings.map(internalSpace => (
    <DSComponentViewerBox
      key={`avatar-${internalSpace}`}
      name={`Avatar, padding = ${internalSpace}`}
    >
      <View style={IOStyles.row}>
        <Avatar internalSpace={internalSpace} logoUri={LogoComuneDiMilano} />
        <HSpacer size={8} />
        <Avatar
          internalSpace={internalSpace}
          logoUri={LogoComuneDiSottoIlMonte}
        />
        <HSpacer size={8} />
        <Avatar
          internalSpace={internalSpace}
          logoUri={LogoComuneDiControguerra}
        />
        <HSpacer size={8} />
        <Avatar internalSpace={internalSpace} logoUri={LogoINPS} />
        <HSpacer size={8} />
        <Avatar internalSpace={internalSpace} logoUri={LogoEDistribuzione} />
        <HSpacer size={8} />
        <Avatar internalSpace={internalSpace} logoUri={LogoAgenziaDifesa} />
        <HSpacer size={8} />
        <Avatar internalSpace={internalSpace} logoUri={LogoMinisteroInterno} />
      </View>
    </DSComponentViewerBox>
  ));

const renderPaymentLogosSmall = () => (
  <View style={styles.itemsWrapper}>
    {Object.entries(IOPaymentLogos).map(([logoItemName]) => (
      <DSLogoPaymentViewerBox
        key={logoItemName}
        name={logoItemName}
        size="medium"
        image={
          <LogoPayment name={logoItemName as IOLogoPaymentType} size={"100%"} />
        }
      />
    ))}
  </View>
);

const renderPaymentLogosBig = () => (
  <View style={styles.itemsWrapper}>
    {Object.entries(IOPaymentExtLogos).map(([logoItemName]) => (
      <DSLogoPaymentViewerBox
        key={logoItemName}
        name={logoItemName}
        size="large"
        image={
          <LogoPaymentExt
            name={logoItemName as IOLogoPaymentExtType}
            size={"100%"}
          />
        }
      />
    ))}
  </View>
);
