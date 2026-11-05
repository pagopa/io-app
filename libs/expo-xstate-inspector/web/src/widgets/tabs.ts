/** Shows the panel of the clicked tab and hides the others. */
export const bindTabs = (tablist: Element) => {
  const tabs = [...tablist.querySelectorAll<HTMLElement>('[role="tab"]')];
  const show = (selected: HTMLElement) =>
    tabs.forEach(tab => {
      tab.ariaSelected = String(tab === selected);
      const panel = document.getElementById(
        tab.getAttribute("aria-controls") ?? ""
      );
      if (panel) {
        panel.hidden = tab !== selected;
      }
    });
  tabs.forEach(tab => (tab.onclick = () => show(tab)));
};
