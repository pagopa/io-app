import { IOColors, useIOTheme } from "@pagopa/io-app-design-system";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { H2 } from "../../../components/core/typography/H2";
import {
  DSAssetViewerBox,
  assetItemGutter,
  renderRasterImage
} from "../components/DSAssetViewerBox";

/* PICTOGRAMS */
import BrokenLink from "../../../../img/broken-link.png";
import AirBaloonRaster from "../../../../img/landing/session_expired.png";
import Baloons from "../../../../img/messages/empty-due-date-list-icon.png";
import AirBaloonArrow from "../../../../img/messages/empty-message-list-icon.png";
import PiggyBank from "../../../../img/messages/empty-transaction-list-icon.png";
import Error from "../../../../img/messages/error-message-detail-icon.png";
import Question from "../../../../img/pictograms/doubt.png";
import Fireworks from "../../../../img/pictograms/fireworks.png";
import Hourglass from "../../../../img/pictograms/hourglass.png";
import CompletedRaster from "../../../../img/pictograms/payment-completed.png";
import Completed from "../../../../img/pictograms/payment-completed.svg";
import BeerMug from "../../../../img/search/beer-mug.png";
import Search from "../../../../img/search/search-icon.png";
import Puzzle from "../../../../img/services/icon-loading-services.png";
import ABILogo from "../../../../img/wallet/cards-icons/abiLogoFallback.png";
import Castle from "../../../../img/wallet/errors/domain-unknown-icon.png";
import Umbrella from "../../../../img/wallet/errors/generic-error-icon.png";
import Abacus from "../../../../img/wallet/errors/invalid-amount-icon.png";
import InProgress from "../../../../img/wallet/errors/missing-payment-id-icon.png";
import Vespa from "../../../../img/wallet/errors/payment-ongoing-icon.png";
import NotAvailable from "../../../../img/wallet/errors/payment-unavailable-icon.png";
import Unrecognized from "../../../../img/wallet/errors/payment-unknown-icon.png";
/* EU Covid Certificate */
import CertificateExpired from "../../../../img/features/euCovidCert/certificate_expired.png";
import CertificateNotFound from "../../../../img/features/euCovidCert/certificate_not_found.png";
import CertificateRevoked from "../../../../img/features/euCovidCert/certificate_revoked.png";
import CertificateWrongFormat from "../../../../img/features/euCovidCert/certificate_wrong_format.png";
/* Donations */
import Heart from "../../../../img/features/uaDonations/heart.svg";
/* Sections */
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

export const DSLegacyPictograms = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen title={"Legacy Pictograms"}>
      <View style={styles.itemsWrapper}>
        <DSAssetViewerBox
          type="raster"
          name={"Fireworks"}
          image={renderRasterImage(Fireworks)}
        />
        <DSAssetViewerBox
          type="raster"
          name={"Question"}
          image={renderRasterImage(Question)}
        />
        <DSAssetViewerBox
          type="raster"
          name={"Hourglass"}
          image={renderRasterImage(Hourglass)}
        />
        <DSAssetViewerBox
          type="raster"
          name={"Air Baloon (raster)"}
          image={renderRasterImage(AirBaloonRaster)}
        />
        <DSAssetViewerBox
          type="raster"
          name={"Air Baloon (arrow)"}
          image={renderRasterImage(AirBaloonArrow)}
        />
        <DSAssetViewerBox
          type="raster"
          name={"Baloons"}
          image={renderRasterImage(Baloons)}
        />
        <DSAssetViewerBox
          type="raster"
          name={"PiggyBank"}
          image={renderRasterImage(PiggyBank)}
        />
        <DSAssetViewerBox
          type="raster"
          name={"Error"}
          image={renderRasterImage(Error)}
        />
        <DSAssetViewerBox
          type="raster"
          name={"BeerMug"}
          image={renderRasterImage(BeerMug)}
        />
        <DSAssetViewerBox
          type="raster"
          name={"Search"}
          image={renderRasterImage(Search)}
        />
        <DSAssetViewerBox
          type="raster"
          name={"Puzzle"}
          image={renderRasterImage(Puzzle)}
        />
        <DSAssetViewerBox
          type="raster"
          name={"ABILogo"}
          image={renderRasterImage(ABILogo)}
        />
        <DSAssetViewerBox
          type="raster"
          name={"Castle"}
          image={renderRasterImage(Castle)}
        />
        <DSAssetViewerBox
          type="raster"
          name={"Umbrella"}
          image={renderRasterImage(Umbrella)}
        />
        <DSAssetViewerBox
          type="raster"
          name={"Abacus"}
          image={renderRasterImage(Abacus)}
        />
        <DSAssetViewerBox
          type="raster"
          name={"Vespa"}
          image={renderRasterImage(Vespa)}
        />
        <DSAssetViewerBox
          type="raster"
          name={"NotAvailable"}
          image={renderRasterImage(NotAvailable)}
        />
        <DSAssetViewerBox
          type="raster"
          name={"InProgress"}
          image={renderRasterImage(InProgress)}
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
        <DSAssetViewerBox name={"Completed"} image={<Completed />} />
        <DSAssetViewerBox
          type="raster"
          name={"BrokenLink"}
          image={renderRasterImage(BrokenLink)}
        />
        <DSAssetViewerBox
          name={"Heart"}
          image={<Heart fill={IOColors.blue} />}
        />
      </View>
      <H2
        color={theme["textHeading-default"]}
        weight={"SemiBold"}
        style={{ marginBottom: 16 }}
      >
        EU Covid Certificate
      </H2>
      <View style={styles.itemsWrapper}>
        <DSAssetViewerBox
          type="raster"
          name={"Certificate Expired"}
          image={renderRasterImage(CertificateExpired)}
        />
        <DSAssetViewerBox
          type="raster"
          name={"Certificate not found"}
          image={renderRasterImage(CertificateNotFound)}
        />
        <DSAssetViewerBox
          type="raster"
          name={"Certificate (revoked)"}
          image={renderRasterImage(CertificateRevoked)}
        />
        <DSAssetViewerBox
          type="raster"
          name={"Certificate (wrong format)"}
          image={renderRasterImage(CertificateWrongFormat)}
        />
        {/* ↳ Duplicate of Question */}
      </View>
    </DesignSystemScreen>
  );
};
