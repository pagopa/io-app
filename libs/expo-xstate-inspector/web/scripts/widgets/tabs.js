/** Shows the panel of the clicked tab and hides the others. */
export const bindTabs = tablist => {
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const show = selected =>
    tabs.forEach(tab => {
      tab.ariaSelected = String(tab === selected);
      document.getElementById(tab.getAttribute("aria-controls")).hidden =
        tab !== selected;
    });
  tabs.forEach(tab => (tab.onclick = () => show(tab)));
};
