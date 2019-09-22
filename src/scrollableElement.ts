/*
On desktop browsers, we make the document body scrollable

However, on mobile browsers, scrolling hides the address bar, which resizes
everything, and makes for bad UX

To work around this, we create a 100vw/100vh element that floats, and scroll
that instead. It's not perfect, but better than the browser behaviour

However, if we put this in an app, we wouldn't show an address bar, so can copy
the desktop behaviour
*/
const isApp = !!process.env.APP_MODE;

if (isApp) document.documentElement.classList.add("app-mode");

export default !isApp &&
window.matchMedia("(hover: none) and (pointer: coarse)").matches
  ? document.getElementById("root")!
  : window;
