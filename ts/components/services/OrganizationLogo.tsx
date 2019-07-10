// A component to provide organization logo
import * as React from "react";
import { StyleSheet } from "react-native";
import variables from "../../theme/variables";
import { MultiImage } from "../ui/MultiImage";

type Props = {
  logoUri: React.ComponentProps<typeof MultiImage>["source"];
};

const styles = StyleSheet.create({
  organizationLogo: {
    height: 32,
    width: 32,
    resizeMode: "contain",
    marginBottom: 6,
    alignSelf: "flex-start",
    marginRight: variables.spacingBase
  }
});

class OrganizationLogo extends React.Component<Props> {
  public render(): React.ReactNode {
    const { logoUri } = this.props;
    return <MultiImage style={styles.organizationLogo} source={logoUri} />;
  }
}

export default OrganizationLogo;
