// Mirror .node-menu in styles.css, the way NODE_WIDTH mirrors .fund-node.
export const MENU_WIDTH = 168
export const MENU_HEIGHT = 76

type Point = { x: number; y: number }
type Size = { width: number; height: number }

const fit = (at: number, menu: number, wrap: number) =>
  Math.max(0, at + menu <= wrap ? at : at - menu)

// A right-click near an edge opens the menu back towards the middle rather than
// off the canvas; a canvas smaller than the menu pins it to the top-left.
export const anchorMenu = (click: Point, wrap: Size): Point => ({
  x: fit(click.x, MENU_WIDTH, wrap.width),
  y: fit(click.y, MENU_HEIGHT, wrap.height),
})
