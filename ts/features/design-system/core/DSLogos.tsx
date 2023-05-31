import * as React from "react";
import { View, StyleSheet, ImageURISource } from "react-native";
import {
  DSLogoPaymentViewerBox,
  logoItemGutter
} from "../components/DSLogoPaymentViewerBox";
import {
  LogoPayment,
  IOLogoPaymentType,
  IOPaymentLogos,
  LogoPaymentExt,
  IOLogoPaymentExtType,
  IOPaymentExtLogos
} from "../../../components/core/logos";
import { H2 } from "../../../components/core/typography/H2";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { useIOTheme } from "../../../components/core/variables/IOColors";
import Avatar from "../../../components/ui/Avatar";
import { getLogoForOrganization } from "../../../utils/organizations";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { logosForService } from "../../../utils/services";
import LogoComuneDiMilano from "../../../../img/utils/1199250158.png";

const styles = StyleSheet.create({
  itemsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: 16,
    marginLeft: (logoItemGutter / 2) * -1,
    marginRight: (logoItemGutter / 2) * -1
  }
});

export const DSLogos = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen title={"Logos"}>
      <H2
        color={theme["textHeading-default"]}
        weight={"SemiBold"}
        style={{ marginBottom: 12 }}
      >
        Avatar
      </H2>
      {renderAvatar()}

      <VSpacer size={24} />

      <H2
        color={theme["textHeading-default"]}
        weight={"SemiBold"}
        style={{ marginBottom: 12 }}
      >
        Payment Networks (Small)
      </H2>
      {renderPaymentLogosSmall()}

      <H2
        color={theme["textHeading-default"]}
        weight={"SemiBold"}
        style={{ marginBottom: 12 }}
      >
        Payment Networks (Big)
      </H2>
      {renderPaymentLogosBig()}
    </DesignSystemScreen>
  );
};

const cdnPath = "https://assets.cdn.io.italia.it/logos/organizations/";

const organizationsURIs = [
  {
    image: `https://assets.cdn.io.italia.it/logos/organizations/1199250158.png`,
    name: "Comune di Milano"
  },
  {
    image: "https://assets.cdn.io.italia.it/logos/organizations/2438750586.png",
    name: "Comune di Roma"
  },
  {
    image: "162210348",
    name: "Comune di Parma"
  },
  {
    image: "82003830161",
    name: "Comune di Sotto il Monte Giovanni XXIII"
  }
];

const renderAvatar = () => (
  <View>
    <Avatar logoUri={LogoComuneDiMilano} />
  </View>
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
