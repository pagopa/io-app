import {
  Banner,
  FeatureInfo,
  H4,
  VStack,
  bannerBackgroundColours,
  useIOTheme
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { Alert } from "react-native";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const onLinkPress = () => {
  Alert.alert("Alert", "Action triggered");
};

const onClose = () => {
  Alert.alert("Alert", "Component dismissed");
};

const sectionTitleMargin = 16;
const blockMargin = 40;
const componentMargin = 40;
const componentInnerMargin = 16;

export const DSAdvice = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen title={"Advice & Banners"}>
      <VStack space={blockMargin}>
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>FeatureInfo</H4>
          {renderFeatureInfo()}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Banner</H4>
          {renderBanner()}
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};

const renderFeatureInfo = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="FeatureInfo · with Icon">
      <VStack space={componentInnerMargin}>
        <FeatureInfo
          iconName="info"
          body={
            "Dopo questo passaggio non sarà più possibile annullare il pagamento"
          }
        />
        <FeatureInfo
          iconName="gallery"
          body={
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ut labore et dolore magna aliqua"
          }
        />
        <FeatureInfo
          iconName="security"
          action={{
            label:
              "Si applicano i Termini e condizioni d’uso e l’Informativa Privacy di Paytipper",
            onPress: onLinkPress
          }}
        />
      </VStack>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="FeatureInfo · with Pictogram">
      <VStack space={componentInnerMargin}>
        <FeatureInfo
          pictogramName="followMessage"
          body={
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ut labore et dolore magna aliqua. sed do eiusmod tempor ut labore et dolore magna aliqua"
          }
        />
        <FeatureInfo
          pictogramName="manual"
          body={
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ut labore et dolore magna aliqua"
          }
        />
        <FeatureInfo
          pictogramName="followMessage"
          body={
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ut labore et dolore magna aliqua. sed do eiusmod tempor ut labore et dolore magna aliqua"
          }
          action={{
            label: "Scopri di più",
            onPress: onLinkPress
          }}
        />
      </VStack>
    </DSComponentViewerBox>
  </VStack>
);

const renderBanner = () => (
  <VStack space={componentMargin}>
    {bannerBackgroundColours.map(color => (
      <VStack space={componentMargin} key={`${color}-block`}>
        <DSComponentViewerBox name={`Banner · Big size, ${color} variant`}>
          <VStack space={componentInnerMargin}>
            <Banner
              color={color}
              size="big"
              title="Banner title"
              pictogramName="charity"
              action="Action text"
              onPress={onLinkPress}
            />
            <Banner
              color={color}
              size="big"
              content={
                "Fai una donazione alle organizzazioni umanitarie che assistono le vittime civile della crisi in Ucraina"
              }
              pictogramName="charity"
            />
            <Banner
              color={color}
              size="big"
              content={
                "Fai una donazione alle organizzazioni umanitarie che assistono le vittime civile della crisi in Ucraina"
              }
              pictogramName="charity"
              action="Dona anche tu"
              onPress={onLinkPress}
            />
            <Banner
              color={color}
              size="big"
              title="Banner title"
              content={
                "Fai una donazione alle organizzazioni umanitarie che assistono le vittime civile della crisi in Ucraina"
              }
              pictogramName="charity"
            />
            <Banner
              color={color}
              size="big"
              title="Banner title"
              content={
                "Fai una donazione alle organizzazioni umanitarie che assistono le vittime civile della crisi in Ucraina"
              }
              pictogramName="charity"
              action="Dona anche tu"
              onPress={onLinkPress}
            />
          </VStack>
        </DSComponentViewerBox>
        <DSComponentViewerBox
          name={`Banner · Big size, ${color} variant, close action`}
        >
          <VStack space={componentInnerMargin}>
            <Banner
              color={color}
              size="big"
              title="Banner title"
              content={
                "Fai una donazione alle organizzazioni umanitarie che assistono le vittime civile della crisi in Ucraina"
              }
              pictogramName="charity"
              onClose={onClose}
              labelClose="Nascondi questo banner"
            />
            <Banner
              color={color}
              size="big"
              content={
                "Fai una donazione alle organizzazioni umanitarie che assistono le vittime civile della crisi in Ucraina"
              }
              action="Dona anche tu"
              onPress={onLinkPress}
              pictogramName="charity"
              onClose={onClose}
              labelClose="Nascondi questo banner"
            />
          </VStack>
        </DSComponentViewerBox>
        <DSComponentViewerBox name={`Banner · Small size, ${color} variant`}>
          <VStack space={componentInnerMargin}>
            <Banner
              color={color}
              size="small"
              title="Banner title"
              content={
                "Fai una donazione alle organizzazioni umanitarie che assistono le vittime civile della crisi in Ucraina"
              }
              pictogramName="charity"
              action="Dona anche tu"
              onPress={onLinkPress}
            />
            <Banner
              color={color}
              size="small"
              content={
                "Fai una donazione alle organizzazioni umanitarie che assistono le vittime civile della crisi in Ucraina"
              }
              action="Dona anche tu"
              onPress={onLinkPress}
              pictogramName="charity"
            />
            <Banner
              color={color}
              size="small"
              content={
                "Fai una donazione alle organizzazioni umanitarie che assistono le vittime civile della crisi in Ucraina"
              }
              pictogramName="charity"
            />
          </VStack>
        </DSComponentViewerBox>
      </VStack>
    ))}
  </VStack>
);
