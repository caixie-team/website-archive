/* global window */
import { customMedia } from "styles/variables.module.css"

const hasWindow = () => typeof window !== "undefined"

export const lteSmallViewport = () => hasWindow()
  && window.matchMedia(customMedia["--lte-small-viewport"]).matches

export const lteMediumViewport = () => hasWindow()
  && window.matchMedia(customMedia["--lte-medium-viewport"]).matches

export const lteLargeViewport = () => hasWindow()
  && window.matchMedia(customMedia["--lte-large-viewport"]).matches

export const isTouchDevice = () => hasWindow()
  && window.matchMedia("(hover: none)").matches
