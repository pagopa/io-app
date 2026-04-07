import {
  Banner,
  bannerBackgroundColours,
  BannerErrorState,
  FeatureInfo,
  H4,
  useIOTheme,
  VStack
} from "@pagopa/io-app-design-system";
import { Alert } from "react-native";

import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";

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
          <H4 color={theme["textHeading-default"]}>BannerErrorState</H4>
          {renderBannerErrorState()}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Banner</H4>
          {renderBanner()}
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};

const renderBannerErrorState = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="BannerErrorState, default icon">
      <BannerErrorState
        actionText={"Riprova"}
        label="Il caricamento delle ricevute è fallito."
        onPress={onLinkPress}
      />
    </DSComponentViewerBox>
    <DSComponentViewerBox name="BannerErrorState, custom icon">
      <BannerErrorState
        actionText={"Riprova"}
        icon="errorFilled"
        label="Il caricamento delle ricevute è fallito."
        onPress={onLinkPress}
      />
    </DSComponentViewerBox>
  </VStack>
);

const renderFeatureInfo = () => (
  <VStack space={componentMargin}>
    <DSComponentViewerBox name="FeatureInfo · with Icon">
      <VStack space={componentInnerMargin}>
        <FeatureInfo
          body={
            "Dopo questo passaggio non sarà più possibile annullare il pagamento"
          }
          iconName="info"
        />
        <FeatureInfo
          body={
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ut labore et dolore magna aliqua"
          }
          iconName="gallery"
        />
        <FeatureInfo
          action={{
            label:
              "Si applicano i Termini e condizioni d’uso e l’Informativa Privacy di Paytipper",
            onPress: onLinkPress
          }}
          iconName="security"
        />
      </VStack>
    </DSComponentViewerBox>
    <DSComponentViewerBox name="FeatureInfo · with Pictogram">
      <VStack space={componentInnerMargin}>
        <FeatureInfo
          body={
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ut labore et dolore magna aliqua. sed do eiusmod tempor ut labore et dolore magna aliqua"
          }
          pictogramProps={{
            name: "followMessage"
          }}
        />
        <FeatureInfo
          body={
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ut labore et dolore magna aliqua"
          }
          pictogramProps={{
            name: "manual"
          }}
        />
        <FeatureInfo
          action={{
            label: "Scopri di più",
            onPress: onLinkPress
          }}
          body={
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ut labore et dolore magna aliqua. sed do eiusmod tempor ut labore et dolore magna aliqua"
          }
          pictogramProps={{
            name: "followMessage"
          }}
        />
      </VStack>
    </DSComponentViewerBox>
  </VStack>
);

const renderBanner = () => (
  <VStack space={componentMargin}>
    {bannerBackgroundColours.map(color => (
      <VStack key={`${color}-block`} space={componentMargin}>
        <DSComponentViewerBox name={`Banner · ${color} variant`}>
          <VStack space={componentInnerMargin}>
            <Banner
              action="Action text"
              color={color}
              onPress={onLinkPress}
              pictogramName="charity"
              title="Banner title"
            />
            <Banner
              color={color}
              content={
                "Fai una donazione alle organizzazioni umanitarie che assistono le vittime civile della crisi in Ucraina"
              }
              pictogramName="charity"
            />
            <Banner
              action="Dona anche tu"
              color={color}
              content={
                "Fai una donazione alle organizzazioni umanitarie che assistono le vittime civile della crisi in Ucraina"
              }
              onPress={onLinkPress}
              pictogramName="charity"
            />
            <Banner
              color={color}
              content={
                "Fai una donazione alle organizzazioni umanitarie che assistono le vittime civile della crisi in Ucraina"
              }
              pictogramName="charity"
              title="Banner title"
            />
            <Banner
              action="Dona anche tu"
              color={color}
              content={
                "Fai una donazione alle organizzazioni umanitarie che assistono le vittime civile della crisi in Ucraina"
              }
              onPress={onLinkPress}
              pictogramName="charity"
              title="Banner title"
            />
          </VStack>
        </DSComponentViewerBox>
        <DSComponentViewerBox name={`Banner · ${color} variant, close action`}>
          <VStack space={componentInnerMargin}>
            <Banner
              color={color}
              content={
                "Fai una donazione alle organizzazioni umanitarie che assistono le vittime civile della crisi in Ucraina"
              }
              labelClose="Nascondi questo banner"
              onClose={onClose}
              pictogramName="charity"
              title="Banner title"
            />
            <Banner
              action="Dona anche tu"
              color={color}
              content={
                "Fai una donazione alle organizzazioni umanitarie che assistono le vittime civile della crisi in Ucraina"
              }
              labelClose="Nascondi questo banner"
              onClose={onClose}
              onPress={onLinkPress}
              pictogramName="charity"
            />
          </VStack>
        </DSComponentViewerBox>
      </VStack>
    ))}
  </VStack>
);
