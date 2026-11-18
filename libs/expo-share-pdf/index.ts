import { File, Paths } from "expo-file-system";
import { Platform } from "react-native";

export { clearSharedPayloads, getSharedPayloads } from "expo-sharing";

export const discardSharedFile = (uri: string): void => {
  if (Platform.OS !== "ios" || !uri.startsWith("file://")) {
    return;
  }
  const file = new File(uri);
  const parent = file.parentDirectory.uri;
  const belongsToAppGroup = Object.values(Paths.appleSharedContainers).some(
    directory => directory.uri === parent
  );
  if (belongsToAppGroup && file.exists) {
    file.delete();
  }
};
