import { IOToast, ListItemHeader, VSpacer } from "@pagopa/io-app-design-system";
import { useState } from "react";
import { View } from "react-native";
import { ItwHighlightBanner } from "../../common/components/ItwHighlightBanner";

export const ItwBannerSection = () => {
  const [remountKey, setRemountKey] = useState(0);

  const handleRemount = () => {
    setRemountKey(prevKey => prevKey + 1);
  };

  return (
    <View
      style={{
        marginHorizontal: -24,
        paddingHorizontal: 24,
        paddingBottom: 24
      }}
    >
      <ListItemHeader
        label="Highlight Banner"
        endElement={{
          type: "buttonLink",
          componentProps: {
            label: "Remount",
            onPress: handleRemount
          }
        }}
      />
      <ItwHighlightBanner
        key={`large-${remountKey}`}
        title="IT-Wallet per i tuoi documenti"
        description="L'unico Wallet di Stato: **pubblico, sicuro e gratuito.** Garantito dallo Stato, accessibile solo a te."
        action="Ottieni IT-Wallet"
        onPress={() => IOToast.info("Pressed")}
      />
      <VSpacer size={16} />
      <ItwHighlightBanner
        key={`small-${remountKey}`}
        title="IT-Wallet per i tuoi documenti"
        description="L'unico Wallet di Stato: **pubblico, sicuro e gratuito.** Garantito dallo Stato, accessibile solo a te."
        action="Ottieni IT-Wallet"
        onPress={() => IOToast.info("Pressed")}
        size="small"
      />
    </View>
  );
};
