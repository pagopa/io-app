export const AVOID_ZOOM_JS = `
const meta = document.createElement('meta');
meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta);
true;
`;
