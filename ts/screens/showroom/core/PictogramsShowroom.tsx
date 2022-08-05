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

/* PICTOGRAMS */
import Fireworks from "../../../../img/pictograms/fireworks.png";
import FireworksWhite from "../../../../img/bonus/bpd/fireworks.png";
import Question from "../../../../img/pictograms/doubt.png";
import Hourglass from "../../../../img/pictograms/hourglass.png";
import AirBaloon from "../../../../img/bonus/siciliaVola/emptyVoucherList.svg";
import AirBaloonRaster from "../../../../img/landing/session_expired.png";
import AirBaloonArrow from "../../../../img/messages/empty-message-list-icon.png";
import Timeout from "../../../../img/bonus/siciliaVola/generateVoucherTimeout.svg";
import Airship from "../../../../img/messages/empty-archive-list-icon.png";
import Baloons from "../../../../img/messages/empty-due-date-list-icon.png";
import PiggyBank from "../../../../img/messages/empty-transaction-list-icon.png";
import Error from "../../../../img/messages/error-message-detail-icon.png";
import BeerMug from "../../../../img/search/beer-mug.png";
import Search from "../../../../img/search/search-icon.png";
import Puzzle from "../../../../img/services/icon-loading-services.png";
import Pin from "../../../../img/services/icon-no-places.png";
import Places from "../../../../img/services/icon-places.png";
import Castle from "../../../../img/wallet/errors/domain-unknown-icon.png";
import Abacus from "../../../../img/wallet/errors/invalid-amount-icon.png";
import Vespa from "../../../../img/wallet/errors/payment-ongoing-icon.png";
import NotAvailable from "../../../../img/wallet/errors/payment-unavailable-icon.png";
import InProgress from "../../../../img/wallet/errors/missing-payment-id-icon.png";
import Unrecognized from "../../../../img/wallet/errors/payment-unknown-icon.png";
import Umbrella from "../../../../img/wallet/errors/generic-error-icon.png";
import ABILogo from "../../../../img/wallet/cards-icons/abiLogoFallback.png";
import CompletedRaster from "../../../../img/pictograms/payment-completed.png";
import Completed from "../../../../img/pictograms/payment-completed.svg";
/* EU Covid Certificate */
import CertificateExpired from "../../../../img/features/euCovidCert/certificate_expired.png";
import CertificateNotFound from "../../../../img/features/euCovidCert/certificate_not_found.png";
import CertificateRevoked from "../../../../img/features/euCovidCert/certificate_revoked.png";
import CertificateWrongFormat from "../../../../img/features/euCovidCert/certificate_wrong_format.png";
/* Donations */
import Heart from "../../../../img/features/uaDonations/heart.svg";

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
    padding: 32,
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
    fontSize: 8,
    textTransform: "uppercase",
    padding: 4,
    borderRadius: 4
  }
});

export const PictogramsShowroom = () => (
  <ShowroomSection title={"Pictograms"}>
    <View style={styles.itemsWrapper}>
      <PictogramBox
        raster={true}
        name={"Fireworks"}
        image={renderRasterImage(Fireworks)}
      />
      <PictogramBox
        raster={true}
        name={"Fireworks (white)"}
        image={renderRasterImage(FireworksWhite)}
      />
      <PictogramBox
        raster={true}
        name={"Question"}
        image={renderRasterImage(Question)}
      />
      <PictogramBox
        raster={true}
        name={"Hourglass"}
        image={renderRasterImage(Hourglass)}
      />
      <PictogramBox name={"Air Baloon"} image={<AirBaloon />} />
      <PictogramBox
        raster={true}
        name={"Air Baloon (raster)"}
        image={renderRasterImage(AirBaloonRaster)}
      />
      <PictogramBox
        raster={true}
        name={"Air Baloon (arrow)"}
        image={renderRasterImage(AirBaloonArrow)}
      />
      <PictogramBox
        raster={true}
        name={"Airship"}
        image={renderRasterImage(Airship)}
      />
      <PictogramBox
        raster={true}
        name={"Baloons"}
        image={renderRasterImage(Baloons)}
      />
      <PictogramBox
        raster={true}
        name={"PiggyBank"}
        image={renderRasterImage(PiggyBank)}
      />
      <PictogramBox
        raster={true}
        name={"Error"}
        image={renderRasterImage(Error)}
      />
      <PictogramBox
        raster={true}
        name={"BeerMug"}
        image={renderRasterImage(BeerMug)}
      />
      <PictogramBox
        raster={true}
        name={"Search"}
        image={renderRasterImage(Search)}
      />
      <PictogramBox
        raster={true}
        name={"Puzzle"}
        image={renderRasterImage(Puzzle)}
      />
      <PictogramBox raster={true} name={"Pin"} image={renderRasterImage(Pin)} />
      <PictogramBox
        raster={true}
        name={"Places"}
        image={renderRasterImage(Places)}
      />
      <PictogramBox
        raster={true}
        name={"ABILogo"}
        image={renderRasterImage(ABILogo)}
      />
      <PictogramBox
        raster={true}
        name={"Castle"}
        image={renderRasterImage(Castle)}
      />
      <PictogramBox
        raster={true}
        name={"Umbrella"}
        image={renderRasterImage(Umbrella)}
      />
      <PictogramBox
        raster={true}
        name={"Abacus"}
        image={renderRasterImage(Abacus)}
      />
      <PictogramBox
        raster={true}
        name={"Vespa"}
        image={renderRasterImage(Vespa)}
      />
      <PictogramBox
        raster={true}
        name={"NotAvailable"}
        image={renderRasterImage(NotAvailable)}
      />
      <PictogramBox
        raster={true}
        name={"InProgress"}
        image={renderRasterImage(InProgress)}
      />
      <PictogramBox
        raster={true}
        name={"Unrecognized"}
        image={renderRasterImage(Unrecognized)}
      />

      <PictogramBox name={"Timeout"} image={<Timeout />} />
      <PictogramBox
        raster={true}
        name={"Completed"}
        image={renderRasterImage(CompletedRaster)}
      />
      <PictogramBox name={"Completed"} image={<Completed />} />
      <PictogramBox name={"Heart"} image={<Heart fill={IOColors.blue} />} />
    </View>
    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
      EU Covid Certificate
    </H2>
    <View style={styles.itemsWrapper}>
      <PictogramBox
        raster={true}
        name={"Certificate Expired"}
        image={renderRasterImage(CertificateExpired)}
      />
      <PictogramBox
        raster={true}
        name={"Certificate not found"}
        image={renderRasterImage(CertificateNotFound)}
      />
      <PictogramBox
        raster={true}
        name={"Certificate (revoked)"}
        image={renderRasterImage(CertificateRevoked)}
      />
      <PictogramBox
        raster={true}
        name={"Certificate (wrong format)"}
        image={renderRasterImage(CertificateWrongFormat)}
      />
      {/* ↳ Duplicate of Question */}
    </View>
  </ShowroomSection>
);

type PictogramBoxProps = {
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

const PictogramBox = (props: PictogramBoxProps) => (
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
