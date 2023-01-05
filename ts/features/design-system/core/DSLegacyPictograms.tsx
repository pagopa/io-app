import * as React from "react";
import { View, StyleSheet } from "react-native";
import {
  AssetViewerBox,
  assetItemGutter,
  renderRasterImage
} from "../components/AssetViewerBox";
import { H2 } from "../../../components/core/typography/H2";
import { IOColors } from "../../../components/core/variables/IOColors";
import IconFont from "../../../components/ui/IconFont";

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
import BrokenLink from "../../../../img/broken-link.png";
/* EU Covid Certificate */
import CertificateExpired from "../../../../img/features/euCovidCert/certificate_expired.png";
import CertificateNotFound from "../../../../img/features/euCovidCert/certificate_not_found.png";
import CertificateRevoked from "../../../../img/features/euCovidCert/certificate_revoked.png";
import CertificateWrongFormat from "../../../../img/features/euCovidCert/certificate_wrong_format.png";
/* Donations */
import Heart from "../../../../img/features/uaDonations/heart.svg";
/* Sections */
import Profile from "../../../../img/icons/profile-illustration.png";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const styles = StyleSheet.create({
  itemsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginLeft: (assetItemGutter / 2) * -1,
    marginRight: (assetItemGutter / 2) * -1,
    marginBottom: 24
  }
});

export const DSLegacyPictograms = () => (
  <DesignSystemScreen title={"Legacy Pictograms"}>
    <View style={styles.itemsWrapper}>
      <AssetViewerBox
        type="raster"
        name={"Fireworks"}
        image={renderRasterImage(Fireworks)}
      />
      <AssetViewerBox
        type="raster"
        name={"Fireworks (white)"}
        image={renderRasterImage(FireworksWhite)}
      />
      <AssetViewerBox
        type="raster"
        name={"Question"}
        image={renderRasterImage(Question)}
      />
      <AssetViewerBox
        type="raster"
        name={"Hourglass"}
        image={renderRasterImage(Hourglass)}
      />
      <AssetViewerBox name={"Air Baloon"} image={<AirBaloon />} />
      <AssetViewerBox
        type="raster"
        name={"Air Baloon (raster)"}
        image={renderRasterImage(AirBaloonRaster)}
      />
      <AssetViewerBox
        type="raster"
        name={"Air Baloon (arrow)"}
        image={renderRasterImage(AirBaloonArrow)}
      />
      <AssetViewerBox
        type="raster"
        name={"Airship"}
        image={renderRasterImage(Airship)}
      />
      <AssetViewerBox
        type="raster"
        name={"Baloons"}
        image={renderRasterImage(Baloons)}
      />
      <AssetViewerBox
        type="raster"
        name={"PiggyBank"}
        image={renderRasterImage(PiggyBank)}
      />
      <AssetViewerBox
        type="raster"
        name={"Error"}
        image={renderRasterImage(Error)}
      />
      <AssetViewerBox
        type="raster"
        name={"BeerMug"}
        image={renderRasterImage(BeerMug)}
      />
      <AssetViewerBox
        type="raster"
        name={"Search"}
        image={renderRasterImage(Search)}
      />
      <AssetViewerBox
        type="raster"
        name={"Puzzle"}
        image={renderRasterImage(Puzzle)}
      />
      <AssetViewerBox
        type="raster"
        name={"Pin"}
        image={renderRasterImage(Pin)}
      />
      <AssetViewerBox
        type="raster"
        name={"Places"}
        image={renderRasterImage(Places)}
      />
      <AssetViewerBox
        type="raster"
        name={"ABILogo"}
        image={renderRasterImage(ABILogo)}
      />
      <AssetViewerBox
        type="raster"
        name={"Castle"}
        image={renderRasterImage(Castle)}
      />
      <AssetViewerBox
        type="raster"
        name={"Umbrella"}
        image={renderRasterImage(Umbrella)}
      />
      <AssetViewerBox
        type="raster"
        name={"Abacus"}
        image={renderRasterImage(Abacus)}
      />
      <AssetViewerBox
        type="raster"
        name={"Vespa"}
        image={renderRasterImage(Vespa)}
      />
      <AssetViewerBox
        type="raster"
        name={"NotAvailable"}
        image={renderRasterImage(NotAvailable)}
      />
      <AssetViewerBox
        type="raster"
        name={"InProgress"}
        image={renderRasterImage(InProgress)}
      />
      <AssetViewerBox
        type="raster"
        name={"Unrecognized"}
        image={renderRasterImage(Unrecognized)}
      />

      <AssetViewerBox name={"Timeout"} image={<Timeout />} />
      <AssetViewerBox
        type="raster"
        name={"Completed"}
        image={renderRasterImage(CompletedRaster)}
      />
      <AssetViewerBox name={"Completed"} image={<Completed />} />
      <AssetViewerBox
        type="raster"
        name={"BrokenLink"}
        image={renderRasterImage(BrokenLink)}
      />
      <AssetViewerBox name={"Heart"} image={<Heart fill={IOColors.blue} />} />
    </View>
    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
      EU Covid Certificate
    </H2>
    <View style={styles.itemsWrapper}>
      <AssetViewerBox
        type="raster"
        name={"Certificate Expired"}
        image={renderRasterImage(CertificateExpired)}
      />
      <AssetViewerBox
        type="raster"
        name={"Certificate not found"}
        image={renderRasterImage(CertificateNotFound)}
      />
      <AssetViewerBox
        type="raster"
        name={"Certificate (revoked)"}
        image={renderRasterImage(CertificateRevoked)}
      />
      <AssetViewerBox
        type="raster"
        name={"Certificate (wrong format)"}
        image={renderRasterImage(CertificateWrongFormat)}
      />
      {/* ↳ Duplicate of Question */}
    </View>

    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 16 }}>
      Sections
    </H2>
    <View style={styles.itemsWrapper}>
      <AssetViewerBox
        size="small"
        colorMode="dark"
        type="raster"
        name={"Profile"}
        image={renderRasterImage(Profile)}
      />
      <AssetViewerBox
        size="small"
        colorMode="dark"
        type="iconFont"
        name={"Messages"}
        image={
          <IconFont
            name={"io-home-messaggi"}
            color={IOColors.white}
            size={24}
          />
        }
      />
      <AssetViewerBox
        size="small"
        colorMode="dark"
        type="iconFont"
        name={"Services"}
        image={
          <IconFont name={"io-home-servizi"} color={IOColors.white} size={48} />
        }
      />
    </View>
  </DesignSystemScreen>
);
