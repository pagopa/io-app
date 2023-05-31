import * as React from "react";
import { View, StyleSheet } from "react-native";
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

const cdnPath = "https://assets.cdn.io.italia.it/logos/organizations/";

const organizationsURIs = [
  {
    imageSource: `${cdnPath}1199250158.png`,
    name: "Comune di Milano"
  },
  {
    imageSource: `${cdnPath}82003830161.png`,
    name: "Comune di Sotto il Monte Giovanni XXIII"
  },
  {
    imageSource: `${cdnPath}82001760675.png`,
    name: "Comune di Controguerra"
  },
  {
    imageSource: `${cdnPath}80078750587.png`,
    name: "INPS"
  },
  {
    imageSource: `${cdnPath}5779711000.png`,
    name: "e-distribuzione"
  },
  {
    imageSource: `${cdnPath}97254170588.png`,
    name: "Agenzia della Difesa"
  },
  {
    imageSource: `${cdnPath}80215430580.png`,
    name: "Ministero dell'Interno"
  }
];

const renderAvatar = () => (
  <DSComponentViewerBox name={`Avatar, default size`}>
    <View style={IOStyles.row}>
      {organizationsURIs.map(({ imageSource }, i) => (
        <>
          <Avatar
            key={i}
            logoUri={[
              {
                uri: imageSource
              }
            ]}
          />
          {i < organizationsURIs.length - 1 && <HSpacer size={4} />}
        </>
      ))}
    </View>
  </DSComponentViewerBox>
);

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
