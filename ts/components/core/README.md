# Core Components 

- [Fonts](#fonts)
- [Vector graphics](#vector-graphics)
 
## Fonts

The application uses the font _Titillium Sans Pro_. Fonts are handled differently than Android and iOS. To use the font, `TitilliumSansPro-SemiboldItalic` example, you must apply the following properties for Android:

```css
{
  fontFamily: 'TitilliumSansPro-SemiboldItalic'
}
```

while in iOS the code to be applied is:

```css
{
  fontFamily: 'Titillium Sans Pro',
  fontWeight: '600',
  fontStyle: 'italic'
}
```

To manage fonts and variants more easily, we have created utility functions within the file [fonts.ts](fonts.ts).

## Vector graphics
Most of the images used in the app can be rendered as vector assets using SVG image format. Currently we have these groups:
- **Pictograms**: assets with an intended size greather than `56px`
- **Icons**: assets with an intended size between `16px` and `56px`
- **Logos**

Once you understand which group you must put the asset in, you must take into consideration the following instructions for the best result in terms of quality and future maintenance:

1. In your user interface design app (Figma/Sketch) make the vector path as simple as possible:
    * Detach the symbol instance to avoid destructive actions to the original source component. Feel free to use a draft or disposable project document.
    * Outline all the present strokes (unless required for dynamic stroke width, but we don't manage this case at the moment)
    * Select all the different paths and flatten into one. Now you should have a single vector layer.
    * Make sure your vector path is centered (both vertically and horizontally) in a square
2. Export your SVG with `1×` preset
3. Delete `width` and `height` attributes and leave the original `viewBox` attribute. You could easily process the image using online editors like [SVGOmg](https://jakearchibald.github.io/svgomg/) (enable `Prefer viewBox to width/height`)
4. To easily preview the available SVG assets, include the original SVG in the `originals` subfolder **with the same filename of your corresponding React component**.
5. Copy all the `<path>` elements into a new React component and replace the original `<path>` with the element `<Path>` (capital P) from the `react-native-svg` package. Replace all the harcoded fill values with the generic `currentColor` value.
6. Add the dynamic size and colour (if required), replacing the hardcoded values with the corresponding props:
```jsx
import { Svg, Path } from "react-native-svg";

const IconSpid = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="M13.615 …"
      fill="currentColor"
    />
  </Svg>
);
```
**Note:** The icon inherit the color from the parent `Svg` container

7. Add the key associated to the single pictogram/icon in the corresponding set. If you want to learn more, read the contextual documentation:
    * [Pictograms](pictograms/README.md)
    * [Icons](icons/README.md)
    * [Logos](logos/README.md)

8. There's no need to add the new pictogram/icon in the `Design System` specific page because it happens automatically.