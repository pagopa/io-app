import { IOToast, ListItemHeader } from "@pagopa/io-app-design-system";
import { useState } from "react";
import { View } from "react-native";
import { ItwEngagementBanner } from "../../common/components/ItwEngagementBanner";

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
      <ItwEngagementBanner
        variant="activation"
        key={`activation-${remountKey}`}
        onPress={() => IOToast.info("Pressed")}
        onClosePress={() => IOToast.info("Closed")}
      />
    </View>
  );
};
