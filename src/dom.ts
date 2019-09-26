import "./dom.css";

const rootTemplate = document.createElement("template");
rootTemplate.innerHTML = `
  <div id="root">
    <div id="sizing"></div>
    <canvas id="canvas"></canvas>
  </div>
`;
document.documentElement.appendChild(rootTemplate.content);

export const sizingElement = document.getElementById("sizing")!;
export const canvasElement = document.getElementById(
  "canvas"
)! as HTMLCanvasElement;

/*
On desktop browsers, we make the document body scrollable

However, on mobile browsers, scrolling hides the address bar, which resizes
everything, and makes for bad UX

To work around this, we create a 100vw/100vh element that floats, and scroll
that instead. It's not perfect, but better than the browser behaviour

However, if we put this in an app, we wouldn't show an address bar, so can copy
the desktop behaviour
*/

if (process.env.REACT_APP_APP_BUILD) {
  document.documentElement.classList.add("app-mode");
}

export const scrollableElement =
  !process.env.REACT_APP_APP_BUILD &&
  window.matchMedia("(hover: none) and (pointer: coarse)").matches
    ? document.getElementById("root")!
    : window;
