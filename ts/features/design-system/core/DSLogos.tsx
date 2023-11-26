import {
  Avatar,
  HSpacer,
  IOColors,
  IOLogoPaymentCardType,
  IOLogoPaymentExtType,
  IOLogoPaymentType,
  IOPaymentCardLogos,
  IOPaymentExtLogos,
  IOPaymentLogos,
  IOVisualCostants,
  LogoPayment,
  LogoPaymentCard,
  LogoPaymentExt,
  VSpacer,
  hexToRgba,
  useIOTheme
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { H2 } from "../../../components/core/typography/H2";
import { LogoPaymentExtended } from "../../../components/ui/LogoPaymentExtended";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import {
  DSLogoPaymentViewerBox,
  logoItemGutter
} from "../components/DSLogoPaymentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

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
        style={{ marginBottom: 16 }}
      >
        Avatar
      </H2>
      {renderAvatar()}

      <VSpacer size={32} />

      <H2
        color={theme["textHeading-default"]}
        weight={"SemiBold"}
        style={{ marginBottom: 16 }}
      >
        Payment Networks (Small)
      </H2>
      {renderPaymentLogosSmall()}

      <VSpacer size={16} />

      <H2
        color={theme["textHeading-default"]}
        weight={"SemiBold"}
        style={{ marginBottom: 16 }}
      >
        Payment Networks (Big)
      </H2>
      {renderPaymentLogosBig()}

      <VSpacer size={16} />

      <H2
        color={theme["textHeading-default"]}
        weight={"SemiBold"}
        style={{ marginBottom: 16 }}
      >
        Banks (Extended)
      </H2>
      {renderLogoPaymentExtended()}

      <VSpacer size={16} />

      <H2
        color={theme["textHeading-default"]}
        weight={"SemiBold"}
        style={{ marginBottom: 16 }}
      >
        Payment Networks (Card)
      </H2>
      {renderPaymentLogosCard()}
    </DesignSystemScreen>
  );
};

const cdnPath = "https://assets.cdn.io.italia.it/logos/organizations/";

const organizationsURIs = [
  {
    name: "Placeholder"
  },
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
  },
  {
    imageSource: `${cdnPath}wrongUri.png`,
    name: "Wrong URI"
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
              logoUri={
                imageSource
                  ? {
                      uri: imageSource
                    }
                  : undefined
              }
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
              logoUri={
                imageSource
                  ? {
                      uri: imageSource
                    }
                  : undefined
              }
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
              logoUri={
                imageSource
                  ? {
                      uri: imageSource
                    }
                  : undefined
              }
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

const renderLogoPaymentExtended = () => (
  <>
    <DSComponentViewerBox name={`LogoPaymentExtended · ABI code defined`}>
      <LogoPaymentExtended
        abiCode="03124"
        dimensions={{ height: 33, width: 150 }}
      />
      <VSpacer />
      <LogoPaymentExtended
        abiCode="08509"
        dimensions={{ height: 33, width: 150 }}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name={`LogoPaymentExtended · ABI code undefined`}>
      <LogoPaymentExtended
        abiCode={undefined}
        dimensions={{ height: 33, width: 150 }}
      />
    </DSComponentViewerBox>
  </>
);

const renderPaymentLogosCard = () => (
  <View style={styles.itemsWrapper}>
    {Object.entries(IOPaymentCardLogos).map(([logoItemName]) => (
      <DSLogoPaymentViewerBox
        key={logoItemName}
        name={logoItemName}
        size="full"
        image={
          <LogoPaymentCard
            align="start"
            height={32}
            name={logoItemName as IOLogoPaymentCardType}
          />
        }
      />
    ))}
    <VSpacer size={24} />
    <DSComponentViewerBox
      fullWidth
      name="Debug mode enabled, possible align values"
    >
      <View
        style={{
          borderRadius: 16,
          padding: 16,
          backgroundColor: IOColors.white,
          borderColor: hexToRgba(IOColors.black, 0.15),
          borderWidth: 1
        }}
      >
        <LogoPaymentCard debugMode height={32} name="payPal" align="start" />
        <VSpacer size={8} />
        <LogoPaymentCard debugMode height={32} name="payPal" align="center" />
        <VSpacer size={8} />
        <LogoPaymentCard debugMode height={32} name="payPal" align="end" />
      </View>
    </DSComponentViewerBox>
  </View>
);
