import IOMarkdown from "../../../components/IOMarkdown";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const MARKDOWN = `
# Lorem Ipsum

## Introduction

Lorem ipsum dolor sit amet, *consectetur adipiscing elit*. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada. 

### History

Lorem ipsum dolor sit amet, **consectetur adipiscing elit**. [Learn more about the history of Lorem Ipsum](https://en.wikipedia.org/wiki/Lorem_ipsum).

## Examples of Use

1. **Graphic Design**
    - Lorem ipsum dolor sit amet
    - Consectetur adipiscing elit
2. **Typography**
    - Vivamus lacinia odio vitae vestibulum
    - Cras venenatis euismod malesuada
3. **Web Development**
    - *Frontend*: HTML, CSS, JavaScript
    - *Backend*: Python, Ruby, Node.js

### Graphic Design

Lorem ipsum dolor sit amet, **consectetur adipiscing elit**. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada.

### Typography

- Lorem ipsum dolor sit amet, consectetur adipiscing elit.
- Vivamus lacinia odio vitae vestibulum vestibulum.
- Cras venenatis euismod malesuada.

### Web Development

1. *Frontend*
    - HTML
    - CSS
    - JavaScript
2. *Backend*
    - Python
    - Ruby
    - Node.js

## Conclusion

---

Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada.
`;

export const DSIOMarkdown = () => (
  <DesignSystemScreen title="IOMarkdown">
    <IOMarkdown content={MARKDOWN} />
  </DesignSystemScreen>
);
