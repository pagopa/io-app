# Icons
There are different sets:
* **General** 
* **Navigation**: Icons used in the main Tab bar
* **Biometric**: Icons used for the biometric identification
* **Categories**: Icons used for the different sectors available in the Carta Giovani Nazionale
* **Product**: PagoPA products' icons 

## Prefixes
- **General**: `Icon…`
- **Navigation**: `IconNav…`
- **Biometric**: `IconBiometric…`
- **Categories**: `IconCateg…`
- **Product**: `IconProduct…`

## Add a new icon
First of all, follow the instructions stated in the main README (`Vector graphics` section).

If you want to add a new icon in the `General` set, open the `Icon.tsx` file and import the React component:
```jsx
[…]
import IconSpid from "./svg/IconSpid";
[…]
```
Add the desired key to the `IOIcons` object with the corresponding component reference:
```jsx
export const IOIcons = {
  spid: IconSpid,
  …
}
```
Add the key to the relative icon set:
```ts
export const IONavIcons = {
  navMessages,
  navWallet,
  navDocuments,
  navServices,
  navProfile,
  // New icon
  navNewIcon
} as const;
```

You can add the recently added icon with the following declaration:
```jsx
// Default size: 24×24px
// Default color: Bluegrey
<Icon name="spid">
```

## View all the available icons
There are two ways:
- In the app, go to the `Profile → Design System → Icons` (you must enable `Debug Mode`)
- In the repository, go to the `svg/originals` subfolder
