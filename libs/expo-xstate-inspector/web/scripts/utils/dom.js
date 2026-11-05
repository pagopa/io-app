export const createCell = (...children) => {
  const cell = document.createElement("td");
  cell.append(...children);
  return cell;
};

export const createSpan = (className, text) => {
  const span = document.createElement("span");
  span.className = className;
  span.textContent = text;
  return span;
};
