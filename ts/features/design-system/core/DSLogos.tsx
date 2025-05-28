import {
  Avatar,
  AvatarSearch,
  H4,
  HSpacer,
  HStack,
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
  VStack,
  hexToRgba,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { ScrollView, StyleSheet, View } from "react-native";
import { LogoPaymentExtended } from "../../../components/ui/LogoPaymentExtended";
import { AvatarDouble } from "../../messages/components/Home/DS/AvatarDouble";
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
    marginLeft: (logoItemGutter / 2) * -1,
    marginRight: (logoItemGutter / 2) * -1,
    rowGap: 16
  },
  horizontalScroll: {
    marginLeft: -IOVisualCostants.appMarginDefault,
    marginRight: -IOVisualCostants.appMarginDefault,
    paddingHorizontal: IOVisualCostants.appMarginDefault
  }
});

const sectionMargin = 40;
const sectionTitleMargin = 16;

export const DSLogos = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen title={"Logos"}>
      <VStack space={sectionMargin}>
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Avatar</H4>
          {renderAvatar()}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Payment Networks (Small)</H4>
          {renderPaymentLogosSmall()}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Payment Networks (Big)</H4>
          {renderPaymentLogosBig()}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Banks (Extended)</H4>
          {renderLogoPaymentExtended()}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Payment Networks (Card)</H4>
          {renderPaymentLogosCard()}
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};

const cdnPath = "https://assets.cdn.io.pagopa.it/logos/organizations/";

const organizationsURIs = [
  {
    name: "Placeholder"
  },
  {
    imageSource: { uri: `${cdnPath}1199250158.png` },
    name: "Comune di Milano"
  },
  {
    imageSource: { uri: `${cdnPath}82003830161.png` },
    name: "Comune di Sotto il Monte Giovanni XXIII"
  },
  {
    imageSource: { uri: `${cdnPath}82001760675.png` },
    name: "Comune di Controguerra"
  },
  {
    imageSource: { uri: `${cdnPath}80078750587.png` },
    name: "INPS"
  },
  {
    imageSource: { uri: `${cdnPath}5779711000.png` },
    name: "e-distribuzione"
  },
  {
    imageSource: { uri: `${cdnPath}97254170588.png` },
    name: "Agenzia della Difesa"
  },
  {
    imageSource: { uri: `${cdnPath}80215430580.png` },
    name: "Ministero dell'Interno"
  },
  {
    imageSource: { uri: `${cdnPath}wrongUri.png`, width: 180, height: 180 },
    name: "Wrong URI"
  }
];

const renderAvatar = () => (
  <VStack space={24}>
    <DSComponentViewerBox name={`Avatar, small size`}>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
      >
        <HStack space={8}>
          {organizationsURIs.map(({ imageSource }, i) => (
            <Avatar key={i} size="small" logoUri={imageSource} />
          ))}
          <HSpacer size={32} />
        </HStack>
      </ScrollView>
    </DSComponentViewerBox>

    <DSComponentViewerBox name={`Avatar, medium size`}>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
      >
        <HStack space={8}>
          {organizationsURIs.map(({ imageSource }, i) => (
            <Avatar key={i} size="medium" logoUri={imageSource} />
          ))}
          <HSpacer size={32} />
        </HStack>
      </ScrollView>
    </DSComponentViewerBox>

    <DSComponentViewerBox name={`AvatarSearch`}>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
      >
        <HStack space={8}>
          {organizationsURIs.map(({ imageSource }, i) => (
            <AvatarSearch key={i} source={imageSource} />
          ))}
          <HSpacer size={32} />
        </HStack>
      </ScrollView>
    </DSComponentViewerBox>

    <DSComponentViewerBox name={`AvatarDouble`}>
      <AvatarDouble backgroundLogoUri={organizationsURIs[1].imageSource} />
    </DSComponentViewerBox>
  </VStack>
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
  <VStack space={24}>
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
  </VStack>
);

const renderPaymentLogosCard = () => (
  <VStack space={24}>
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
        <VStack space={8}>
          <LogoPaymentCard debugMode height={32} name="payPal" align="start" />
          <LogoPaymentCard debugMode height={32} name="payPal" align="center" />
          <LogoPaymentCard debugMode height={32} name="payPal" align="end" />
        </VStack>
      </View>
    </DSComponentViewerBox>
  </VStack>
);
