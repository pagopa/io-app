import { ImageSource } from "react-native-vector-icons/Icon";

/**
 * This type represents a transaction Manager. One manager should be associated to each payment method not handled by PagoPA
 * (this will be replaced by pagoPA's Psp)
 */
export type TransactionManager = Readonly<{
  id: number;
  maxFee: number;
  icon: ImageSource;
}>;
