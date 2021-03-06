import React from "react";

const Curve = ({
  curveColor,
  curveWidth,
  positions,
}) => {

  const [
    originX,
    originY,
    bezierPoint1X,
    bezierPoint1Y,
    bezierPoint2X,
    bezierPoint2Y,
    destinationX,
    destinationY,
  ] = positions;

  const curve = `M${originX},${originY}
    C${bezierPoint1X},${bezierPoint1Y}
    ${bezierPoint2X},${bezierPoint2Y}
    ${destinationX},${destinationY}`;

    return (
      <path
        fill="none"
        stroke={curveColor}
        strokeWidth={curveWidth}
        d={curve}
      />
    );
}

export default Curve;
