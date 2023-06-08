import * as React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
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
import { IOVisualCostants } from "../../../components/core/variables/IOStyles";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";

const styles = StyleSheet.create({
  itemsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: 16,
    marginLeft: (logoItemGutter / 2) * -1,
    marginRight: (logoItemGutter / 2) * -1
  },
  horizontalScroll: {
    marginLeft: -IOVisualCostants.appMarginDefault,
    marginRight: -IOVisualCostants.appMarginDefault,
    paddingHorizontal: IOVisualCostants.appMarginDefault
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
  <>
    <DSComponentViewerBox name={`Avatar, small size, circle shape`}>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
      >
        {organizationsURIs.map(({ imageSource }, i) => (
          <React.Fragment key={i}>
            <Avatar
              shape="circle"
              size="small"
              logoUri={[
                {
                  uri: imageSource
                }
              ]}
            />
            {i < organizationsURIs.length - 1 && <HSpacer size={4} />}
          </React.Fragment>
        ))}
      </ScrollView>
    </DSComponentViewerBox>
    <DSComponentViewerBox name={`Avatar, small size, square shape`}>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
      >
        {organizationsURIs.map(({ imageSource }, i) => (
          <React.Fragment key={i}>
            <Avatar
              shape="square"
              size="small"
              logoUri={[
                {
                  uri: imageSource
                }
              ]}
            />
            {i < organizationsURIs.length - 1 && <HSpacer size={8} />}
          </React.Fragment>
        ))}
      </ScrollView>
    </DSComponentViewerBox>
    <DSComponentViewerBox name={`Avatar, medium size, square shape`}>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
      >
        {organizationsURIs.map(({ imageSource }, i) => (
          <React.Fragment key={i}>
            <Avatar
              shape="square"
              size="medium"
              logoUri={[
                {
                  uri: imageSource
                }
              ]}
            />
            {i < organizationsURIs.length - 1 && <HSpacer size={8} />}
          </React.Fragment>
        ))}
      </ScrollView>
    </DSComponentViewerBox>
  </>
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
