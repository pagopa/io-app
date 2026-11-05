export const createCell = (...children: Array<Node | string>) => {
  const cell = document.createElement("td");
  cell.append(...children);
  return cell;
};

export const createSpan = (className: string, text: string) => {
  const span = document.createElement("span");
  span.className = className;
  span.textContent = text;
  return span;
};
