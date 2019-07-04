import React from "react"
import PropTypes from "prop-types"
import posed, { PoseGroup } from "react-pose"

const TransitionWrapper = ({ children, location }) => {
  const RoutesContainer = posed.div({
    enter: {
      opacity: 1,
      y: 0,
      beforeChildren: true,
    },
    exit: {
      opacity: 0,
      y: 0,
      afterChildren: true,
    },
  })

  return (
    <div style={{
      overflow: "hidden",
    }}>
      <PoseGroup>
        <RoutesContainer key={location.pathname}>
          {children}
        </RoutesContainer>
      </PoseGroup>
    </div>
  )
}

TransitionWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  location: PropTypes.object.isRequired,
}

export default TransitionWrapper
