import {
  H4,
  IOPictograms,
  IOPictogramsLegacy,
  Pictogram,
  VStack,
  useIOTheme
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import {
  DSAssetViewerBox,
  assetItemGutter,
  renderRasterImage
} from "../components/DSAssetViewerBox";

/* PICTOGRAMS */
import BrokenLink from "../../../../img/broken-link.png";
import Question from "../../../../img/pictograms/doubt.png";
import CompletedRaster from "../../../../img/pictograms/payment-completed.png";
import ABILogo from "../../../../img/wallet/cards-icons/abiLogoFallback.png";
import Umbrella from "../../../../img/wallet/errors/generic-error-icon.png";
import NotAvailable from "../../../../img/wallet/errors/payment-unavailable-icon.png";
import Unrecognized from "../../../../img/wallet/errors/payment-unknown-icon.png";
/* Sections */
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const styles = StyleSheet.create({
  itemsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginLeft: (assetItemGutter / 2) * -1,
    marginRight: (assetItemGutter / 2) * -1,
    rowGap: 16
  }
});

const sectionTitleMargin = 16;
const blockMargin = 48;

export const DSLegacyPictograms = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen title={"Legacy Pictograms"}>
      <VStack space={blockMargin}>
        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Vector</H4>
          {renderVectorPictograms()}
        </VStack>

        <VStack space={sectionTitleMargin}>
          <H4 color={theme["textHeading-default"]}>Raster</H4>
          {renderRasterPictograms()}
        </VStack>
      </VStack>
    </DesignSystemScreen>
  );
};

const renderVectorPictograms = () => (
  <View style={styles.itemsWrapper}>
    {Object.entries(IOPictogramsLegacy).map(([pictogramItemName]) => (
      <DSAssetViewerBox
        key={pictogramItemName}
        name={pictogramItemName}
        image={
          <Pictogram name={pictogramItemName as IOPictograms} size="100%" />
        }
      />
    ))}
  </View>
);

const renderRasterPictograms = () => (
  <View style={styles.itemsWrapper}>
    <DSAssetViewerBox
      type="raster"
      name={"Question"}
      image={renderRasterImage(Question)}
    />
    <DSAssetViewerBox
      type="raster"
      name={"ABILogo"}
      image={renderRasterImage(ABILogo)}
    />
    <DSAssetViewerBox
      type="raster"
      name={"Umbrella"}
      image={renderRasterImage(Umbrella)}
    />
    <DSAssetViewerBox
      type="raster"
      name={"NotAvailable"}
      image={renderRasterImage(NotAvailable)}
    />
    <DSAssetViewerBox
      type="raster"
      name={"Unrecognized"}
      image={renderRasterImage(Unrecognized)}
    />

    <DSAssetViewerBox
      type="raster"
      name={"Completed"}
      image={renderRasterImage(CompletedRaster)}
    />
    <DSAssetViewerBox
      type="raster"
      name={"BrokenLink"}
      image={renderRasterImage(BrokenLink)}
    />
  </View>
);
