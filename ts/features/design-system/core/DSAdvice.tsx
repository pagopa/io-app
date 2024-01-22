import {
  Banner,
  FeatureInfo,
  Icon,
  VSpacer,
  bannerBackgroundColours
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { Alert, StyleSheet, View } from "react-native";
import { InfoBox } from "../../../components/box/InfoBox";
import PaymentBannerComponent from "../../../components/wallet/PaymentBannerComponent";
import { DSFullWidthComponent } from "../components/DSFullWidthComponent";

/* Types */
import { ImportoEuroCents } from "../../../../definitions/backend/ImportoEuroCents";
import AdviceComponent from "../../../components/AdviceComponent";
import { Body } from "../../../components/core/typography/Body";
import { H2 } from "../../../components/core/typography/H2";
import { H5 } from "../../../components/core/typography/H5";
import { Label } from "../../../components/core/typography/Label";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const styles = StyleSheet.create({
  content: {
    flex: 1,
    width: "100%",
    justifySelf: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around"
  }
});

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

    <VSpacer size={40} />
    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
      Legacy components
    </H2>
    <AdviceComponent
      text={
        "Dopo questo passaggio non sarà più possibile annullare il pagamento."
      }
    />
    <VSpacer size={16} />
    <View style={[styles.content, IOStyles.horizontalContentPadding]}>
      <InfoBox>
        <Body>
          Lorem ipsum dolor sit amet, consectetur adipisci elit, sed do eiusmod
          tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim
          veniam, quis nostrum exercitationem ullamco laboriosam, nisi ut
          aliquid ex ea commodi consequatur.
        </Body>
      </InfoBox>
    </View>
    <InfoBox alignedCentral={true} iconSize={24} iconColor={"bluegreyDark"}>
      <H5 weight={"Regular"}>
        {
          "Per verificare la tua carta, tratteniamo € 0.02. Non preoccuparti: ti restituiremo l'importo al più presto."
        }
      </H5>
    </InfoBox>
    <InfoScreenComponent
      image={<Icon name="info" />}
      title={"Title"}
      body={
        <Body style={{ textAlign: "center" }}>
          Lorem ipsum dolor sit amet, consectetur adipisci elit, sed do eiusmod
          tempor incidunt ut labore et dolore magna aliqua.
        </Body>
      }
    />
    <VSpacer size={16} />
    <DSFullWidthComponent>
      <PaymentBannerComponent
        paymentReason={"Pagamento buoni pasto mensa scuola"}
        fee={100 as ImportoEuroCents}
        currentAmount={30000 as ImportoEuroCents}
      />
    </DSFullWidthComponent>
    <VSpacer size={24} />
    <View style={[styles.content, IOStyles.horizontalContentPadding]}>
      <InfoBox iconName="profile" iconColor="bluegrey">
        <Label color={"bluegrey"} weight={"Regular"}>
          Puoi aggiungere o modificare i tuoi IBAN in qualsiasi momento
          visitando la sezione Profilo
        </Label>
      </InfoBox>
    </View>
    <VSpacer size={40} />
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
