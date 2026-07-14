# Icons
There are different sets:
* **General** 
* **Navigation**: Icons used in the main Tab bar
* **Biometric**: Icons used for the biometric identification
* **Categories**: Icons used for the different sectors available in the Carta Giovani Nazionale
* **Product**: PagoPA products' icons
* **System**: OS-specific icons (iOS/Android)

## Add a new icon

### Prerequisites

In your user interface design app (Figma/Sketch) export your SVG with `1×` preset. The name usually consists of a specific prefix followed by the associated key:
  - **General**: `Icon…`
  - **Navigation**: `IconNav…`
  - **Biometric**: `IconBiometric…`
  - **Categories**: `IconCateg…`
  - **Product**: `IconProduct…`
  - **System**: `IconSystem…`

> [!important]
> The icon must be contained within a `24×24` frame.

> [!tip]
> If you want to add a new `Wallet` icon to be used in the main tab bar, your icon will have a `IconNavWallet` filename. If it doesn't belong to a specific set, you just put the name after the prefix `Icon…`, so `IconWallet`

> [!caution]
> This filename will be the same as the React component, so make sure you don't already have a component with that filename

### Create the corresponding React component

#### Using `scripts/generateNewIcons.js`
1. Move the exported file to the `icons/svg/originals` folder
2. In your terminal, in the same folder, run the command: `yarn generate:icons`
3. The script will process `scripts/icons_timestamp.txt`, generate the new React components (with `*.tsx` extension) following exactly the steps listed in the manual process (see below), and process **only the files added after this timestamp value**
4. If the `generateNewIcons` script accidentally overwrites older React components, remember to discard the changes before committing

> [!caution] 
> This script is designed to work on monochromatic icons only. To avoid disruption to current icons that are not monochromatic, this script will skip any icon that starts with the following prefix: `IconSystem…`, `IconBiom…`, `IconProduct…`.
> For these particular cases, you must follow the manual process.

#### Manual process (alternative)

1. Move the exported file to the `icons/svg/originals` folder
2. In your original SVG file, delete `width` and `height` attributes and leave the original `viewBox` attribute. You could easily process the image using online editors like [SVGOmg](https://jakearchibald.github.io/svgomg/) (enable `Prefer viewBox to width/height`)
3. In the `icons/svg` folder, create a new React component (with a `.tsx` extension) of the same name
4. Copy all the `<path>` elements into the new React component and replace the original `<path>` with the element `<Path>` (capital P) from the `react-native-svg` package. Replace all the harcoded fill values with the generic `currentColor` value, so that the icon inherits the color from the parent `Svg` container

5. Add the dynamic size and colour (if required), replacing the hardcoded values with the corresponding props. The final result should be similar to the following:
    ```tsx
    import { Svg, Path } from "react-native-svg";
    // [...]

    const IconSpid = ({ size, style }: SVGIconProps) => (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
        <Path
          d="M13.615 …"
          fill="currentColor"
        />
      </Svg>
    );
    ```
6. Repeat the previous steps for each icon
7. Once you have finished processing all the new icons, run `node generateNewTimestamp` to avoid overwriting these files with the `generateNewIcons` process.

> [!caution] 
> The `currentColor` value should only be added for monochromatic icons. For example, if you export an `IconSystem...` with specific color values, don't add it at all.

#### Wrong icon rendering?
Before exporting the SVG file:
1. Detach the symbol instance to avoid destructive actions to the original source component. Use a draft or disposable project document. **Don't detach it** if you are in the original Design System project file
2. Outline all the present strokes (unless required for dynamic stroke width, but we don't manage this case at the moment)
3. Select all the different paths and flatten into one. Now you should have a single vector layer.
4. Make sure your vector path is centered (both vertically and horizontally) in a square

### Add the corresponding key to the `Icon` component

Add the desired key to the `IOIcons` object with the corresponding component reference:
```tsx
export const IOIcons = {
  spid: IconSpid,
  …
}
```
There's no need to add the new icon in the specific Design System page because it happens automatically.

> [!important]
> To keep the icons grouped by sets, remember to put the key above the icons with a specific prefix

If the icon belongs to a specific set, add the key to the relative icon set as well:
```tsx
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

### Use the new icon in a different component

You can add the recently added icon with the following declaration:
```jsx
// Default size: 24×24px
// Default color: Grey-700
<Icon name="spid">
```

## View all the available icons
There are two ways:
- In the main app, go to the `Profile → Design System → Icons` (you must enable `Debug Mode`)
- In the repository, go to the `svg/originals` subfolder
