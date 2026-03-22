import React from "react"
import { StyleSheet } from "react-native"
import { BlurView } from "@react-native-community/blur"
import Svg, { Path } from "react-native-svg"
import { Colors } from "../utilities/AppTheme"

const CurvedTabBarBackground = () => {
  return (
    <>
      <BlurView
        blurType="light"
        blurAmount={80}
        reducedTransparencyFallbackColor="rgba(255,255,255,0.9)"
        style={StyleSheet.absoluteFill}
      />

      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 375 90"
        style={StyleSheet.absoluteFill}
      >
        <Path
          d="
            M0 20
            Q187.5 -20 375 20
            L375 90
            L0 90
            Z
          "
          fill="rgba(255,255,255,0.85)"
        />
      </Svg>
    </>
  )
}

export default CurvedTabBarBackground
