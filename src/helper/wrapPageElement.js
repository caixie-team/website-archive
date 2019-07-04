import React from "react"
import TransitionWrapper from "./transitionWrapper"

const wrapPageElement = ({ element, props }) => {
  return <TransitionWrapper {...props} >{element}</TransitionWrapper>
}

export default wrapPageElement
