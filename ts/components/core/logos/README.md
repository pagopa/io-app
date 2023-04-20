# Logos
There are different sets:
* **Payment Logos (default)**: logos used in the payment methods
* **Payment Logos (extended version)**: bigger version of logos used in the payment methods

## Prefixes
- **Payment Logos**: `LogoPayment…`
- **Payment Logos (extended)**: `LogoPaymentExt…`

## Add a new logo
First of all, follow the instructions stated in the main README (`Vector graphics` section).

If you want to add a new logo in the _Payment Logos_ set, open the `LogoPayment.tsx` file and import the React component:
```jsx
[…]
import LogoPaymentMaestro from "./svg/LogoPaymentMaestro";
[…]
```
Add the desired key to the `IOPaymentLogos` object with the corresponding component reference:
```jsx
export const IOPaymentLogos = {
  maestro: LogoPaymentMaestro,
  …
} as const;
```
You can add the recently added icon with the following declaration:
```jsx
// Default size: 24×24px
<LogoPayment name="maestro">
```

## View all the available icons
There are two ways:
- In the app, go to the `Profile → Design System → Icons` (you must enable `Debug Mode`)
- In the repository, go to the `svg/originals` subfolder
