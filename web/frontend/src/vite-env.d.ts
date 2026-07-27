/// <reference types="vite/client" />

// @stylexjs/unplugin's devMode:'css-only' virtual module — a side-effect
// import that busts the dev-only /virtual:stylex.css <link> tag's cache on
// each HMR update. No runtime exports.
declare module 'virtual:stylex:css-only' {}
