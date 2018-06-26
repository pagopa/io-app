import { ImageSourcePropType } from "react-native";

export type PreferenceItem = Readonly<{
  id: string;
  icon: ImageSourcePropType;
  valuePreview: string;
}>;
