import React from 'react'
import { StyleSheet } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { Colors } from '../utilities/AppTheme'

interface GradientBackgroundProps {
  children: React.ReactNode
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({ children }) => {
  return (
    <LinearGradient
      colors={Colors.gradient.cinema}
      style={styles.container}
    >
      {children}
    </LinearGradient>
  )
}

export default GradientBackground

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
