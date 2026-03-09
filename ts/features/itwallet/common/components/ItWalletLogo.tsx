import { useIOThemeContext } from "@pagopa/io-app-design-system";
import { SvgProps } from "react-native-svg";
import Logo from "../../../../../img/features/itWallet/brand/itw_logo.svg";
import LogoDark from "../../../../../img/features/itWallet/brand/itw_logo_dark.svg";

export const ItWalletLogo = (props: SvgProps) => {
  const { themeType } = useIOThemeContext();
  return themeType === "light" ? <Logo {...props} /> : <LogoDark {...props} />;
};
