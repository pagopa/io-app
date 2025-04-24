import { IOToast, ListItemHeader, VSpacer } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { HighlightBanner } from "../../common/components/HighlightBanner";

export const ItwBannerSection = () => (
  <View
    style={{
      marginHorizontal: -24,
      paddingHorizontal: 24,
      paddingBottom: 24
    }}
  >
    <ListItemHeader label="Highlight Banner" />
    <HighlightBanner
      title="IT-Wallet per i tuoi documenti"
      description="L’unico Wallet di Stato: **pubblico, sicuro e gratuito.** Garantito dallo Stato, accessibile solo a te."
      action="Ottieni IT-Wallet"
      onPress={() => IOToast.info("Pressed")}
    />
    <VSpacer size={16} />
    <HighlightBanner
      title="IT-Wallet per i tuoi documenti"
      description="L’unico Wallet di Stato: **pubblico, sicuro e gratuito.** Garantito dallo Stato, accessibile solo a te."
      action="Ottieni IT-Wallet"
      onPress={() => IOToast.info("Pressed")}
      size="small"
    />
  </View>
);
