import { ColorSchemeName } from "react-native";
import { SvgProps } from "react-native-svg";
import Logo from "../../../../../img/features/itWallet/brand/itw_id_logo.svg";
import LogoDark from "../../../../../img/features/itWallet/brand/itw_id_logo_dark.svg";

type Props = SvgProps & {
  // Optional color scheme override, defaults to current theme from context
  colorScheme?: ColorSchemeName;
};

export const ItWalletIdLogo = ({ colorScheme, ...svgProps }: Props) =>
  colorScheme === "dark" ? <LogoDark {...svgProps} /> : <Logo {...svgProps} />;
