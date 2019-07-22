/* eslint-disable import/prefer-default-export */
// import Wrapper from "./src/helper/wrapPageElement"
//
// export const wrapPageElement = Wrapper

export const onClientEntry = async () => {
  if (typeof IntersectionObserver === "undefined") {
    await import("intersection-observer")
  }
}
