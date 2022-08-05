import * as React from "react";
import {
  Text,
  View,
  StyleSheet,
  Image as NativeImage,
  ImageSourcePropType,
  ImageBackground
} from "react-native";
import { H2 } from "../../../components/core/typography/H2";
import { H5 } from "../../../components/core/typography/H5";
import { IOColors } from "../../../components/core/variables/IOColors";
import { ShowroomSection } from "../ShowroomSection";

/* Fake Transparent BG */
import FakeTransparentBg from "../../../../img/utils/transparent-background-pattern.png";

/* ILLUSTRATIONS */
/* Onboarding */
import Landing05 from "../../../../img/landing/05.png";
import Landing01 from "../../../../img/landing/01.png";
import Landing02 from "../../../../img/landing/02.png";
import Landing03 from "../../../../img/landing/03.png";
import Landing04 from "../../../../img/landing/04.png";
/* CIE */
import LandingCIE from "../../../../img/cie/CIE-onboarding-illustration.png";
import PlacingCard from "../../../../img/cie/place-card-illustration.png";

const illustrationItemGutter = 16;

const styles = StyleSheet.create({
  itemsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginLeft: (illustrationItemGutter / 2) * -1,
    marginRight: (illustrationItemGutter / 2) * -1,
    marginBottom: 16
  },
  illustrationWrapper: {
    width: "50%",
    justifyContent: "flex-start",
    marginBottom: 16,
    paddingHorizontal: illustrationItemGutter / 2
  },
  bgImage: {
    position: "absolute",
    width: "150%",
    height: "150%"
  },
  image: {
    width: "100%",
    height: "100%"
  },
  illustrationItem: {
    overflow: "hidden",
    position: "relative",
    aspectRatio: 1,
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderWidth: 1
  },
  rasterPill: {
    position: "absolute",
    right: 8,
    top: 8,
    overflow: "hidden",
    backgroundColor: IOColors.orange,
    color: "#FFFFFF",
    fontSize: 9,
    textTransform: "uppercase",
    padding: 4,
    borderRadius: 4
  }
});

export const IllustrationsShowroom = () => (
  <ShowroomSection title={"Illustrations"}>
    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
      Onboarding
    </H2>
    <View style={styles.itemsWrapper}>
      <IllustrationBox
        raster={true}
        name={"05"}
        image={renderRasterImage(Landing05)}
      ></IllustrationBox>
      <IllustrationBox
        raster={true}
        name={"01"}
        image={renderRasterImage(Landing01)}
      ></IllustrationBox>
      <IllustrationBox
        raster={true}
        name={"02"}
        image={renderRasterImage(Landing02)}
      ></IllustrationBox>
      <IllustrationBox
        raster={true}
        name={"03"}
        image={renderRasterImage(Landing03)}
      ></IllustrationBox>
      <IllustrationBox
        raster={true}
        name={"04"}
        image={renderRasterImage(Landing04)}
      ></IllustrationBox>
    </View>
    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
      CIE
    </H2>
    <View style={styles.itemsWrapper}>
      <IllustrationBox
        raster={true}
        name={"CIE"}
        image={renderRasterImage(LandingCIE)}
      ></IllustrationBox>
      <IllustrationBox
        raster={true}
        name={"Placing Card"}
        image={renderRasterImage(PlacingCard)}
      ></IllustrationBox>
    </View>
  </ShowroomSection>
);

type IllustrationBoxProps = {
  name: string;
  image: React.ReactNode;
  raster?: boolean;
};

const renderRasterImage = (image: ImageSourcePropType) => (
  <NativeImage
    source={image}
    resizeMode={"contain"}
    style={styles.image}
    testID={"rasterImage"}
  />
);

const IllustrationBox = (props: IllustrationBoxProps) => (
  <View style={styles.illustrationWrapper}>
    <View
      style={{
        ...styles.illustrationItem
      }}
    >
      <ImageBackground
        style={{
          position: "absolute",
          width: "200%",
          height: "200%",
          opacity: 0.4
        }}
        source={FakeTransparentBg}
      />
      {props.image}
      {props.raster && <Text style={styles.rasterPill}>Png</Text>}
    </View>
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 4
      }}
    >
      {props.name && (
        <H5
          color={"bluegrey"}
          style={{ alignSelf: "flex-start" }}
          weight={"Regular"}
        >
          {props.name}
        </H5>
      )}
    </View>
  </View>
);
