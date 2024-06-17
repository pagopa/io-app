import {
  Banner,
  FeatureInfo,
  VSpacer,
  bannerBackgroundColours
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { Alert, View } from "react-native";

/* Types */
import { H2 } from "../../../components/core/typography/H2";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const onLinkPress = () => {
  Alert.alert("Alert", "Action triggered");
};

const onClose = () => {
  Alert.alert("Alert", "Component dismissed");
};

export const DSAdvice = () => (
  <DesignSystemScreen title={"Advice & Banners"}>
    {renderFeatureInfo()}

    <VSpacer size={24} />

    {renderBanner()}
  </DesignSystemScreen>
);

const renderFeatureInfo = () => (
  <>
    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
      FeatureInfo
    </H2>
    <DSComponentViewerBox name="FeatureInfo · with Icon">
      <FeatureInfo
        iconName="info"
        body={
          "Dopo questo passaggio non sarà più possibile annullare il pagamento"
        }
      />
      <VSpacer size={24} />
      <FeatureInfo
        iconName="gallery"
        body={
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ut labore et dolore magna aliqua"
        }
      />
      <VSpacer size={24} />
      <FeatureInfo
        iconName="security"
        actionLabel="Si applicano i Termini e condizioni d’uso e l’Informativa Privacy di Paytipper"
        actionOnPress={onLinkPress}
      />
    </DSComponentViewerBox>
    <VSpacer size={16} />
    <DSComponentViewerBox name="FeatureInfo · with Pictogram">
      <FeatureInfo
        pictogramName="followMessage"
        body={
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ut labore et dolore magna aliqua. sed do eiusmod tempor ut labore et dolore magna aliqua"
        }
      />
      <VSpacer size={24} />
      <FeatureInfo
        pictogramName="manual"
        body={
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ut labore et dolore magna aliqua"
        }
      />
      <VSpacer size={24} />
      <FeatureInfo
        pictogramName="followMessage"
        body={
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor ut labore et dolore magna aliqua. sed do eiusmod tempor ut labore et dolore magna aliqua"
        }
        actionLabel="Scopri di più"
        actionOnPress={onLinkPress}
      />
    </DSComponentViewerBox>
  </>
);

const renderBanner = () => {
  const viewRef = React.createRef<View>();

  return (
    <>
      <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
        Banner
      </H2>
      {bannerBackgroundColours.map(color => (
        <React.Fragment key={`${color}-block`}>
          <DSComponentViewerBox name={`Banner · Big size, ${color} variant`}>
            <Banner
              viewRef={viewRef}
              color={color}
              size="big"
              title="Banner title"
              pictogramName="charity"
              action="Action text"
              onPress={onLinkPress}
            />
            <VSpacer size={24} />
            <Banner
              viewRef={viewRef}
              color={color}
              size="big"
              content={
                "Fai una donazione alle organizzazioni umanitarie che assistono le vittime civile della crisi in Ucraina"
              }
              pictogramName="charity"
            />
            <VSpacer size={24} />
            <Banner
              viewRef={viewRef}
              color={color}
              size="big"
              content={
                "Fai una donazione alle organizzazioni umanitarie che assistono le vittime civile della crisi in Ucraina"
              }
              pictogramName="charity"
              action="Dona anche tu"
              onPress={onLinkPress}
            />
            <VSpacer size={24} />
            <Banner
              viewRef={viewRef}
              color={color}
              size="big"
              title="Banner title"
              content={
                "Fai una donazione alle organizzazioni umanitarie che assistono le vittime civile della crisi in Ucraina"
              }
              pictogramName="charity"
            />
            <VSpacer size={24} />
            <Banner
              viewRef={viewRef}
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
          </DSComponentViewerBox>
          <DSComponentViewerBox
            name={`Banner · Big size, ${color} variant, close action`}
          >
            <Banner
              viewRef={viewRef}
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
            <VSpacer size={24} />
            <Banner
              viewRef={viewRef}
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
          </DSComponentViewerBox>
          <DSComponentViewerBox name={`Banner · Small size, ${color} variant`}>
            <Banner
              viewRef={viewRef}
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
            <VSpacer size={24} />
            <Banner
              viewRef={viewRef}
              color={color}
              size="small"
              content={
                "Fai una donazione alle organizzazioni umanitarie che assistono le vittime civile della crisi in Ucraina"
              }
              action="Dona anche tu"
              onPress={onLinkPress}
              pictogramName="charity"
            />
            <VSpacer size={24} />
            <Banner
              viewRef={viewRef}
              color={color}
              size="small"
              content={
                "Fai una donazione alle organizzazioni umanitarie che assistono le vittime civile della crisi in Ucraina"
              }
              pictogramName="charity"
            />
          </DSComponentViewerBox>
        </React.Fragment>
      ))}
    </>
  );
};
