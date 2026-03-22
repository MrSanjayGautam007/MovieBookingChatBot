import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Feather from 'react-native-vector-icons/Feather'
import { Responsive } from '../utilities/Responsive'
import { Colors } from '../utilities/AppTheme'

const AboutUsScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={[styles.header, { paddingTop: insets.top + Responsive.spacing[15] }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={Responsive.fontSize[24]} color={Colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.logoSection}>
          <MaterialIcons name="smart-toy" size={Responsive.fontSize[80]} color={Colors.primary} />
          <Text style={styles.appName}>MovieBot</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.text}>
            MovieBot is your ultimate cinema companion, making movie ticket booking simple, fast, and enjoyable. 
            We combine AI-powered chat assistance with seamless booking to give you the best movie experience.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We Offer</Text>
          <View style={styles.featureItem}>
            <MaterialIcons name="check-circle" size={Responsive.fontSize[20]} color={Colors.status.success} />
            <Text style={styles.featureText}>Easy movie ticket booking</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="check-circle" size={Responsive.fontSize[20]} color={Colors.status.success} />
            <Text style={styles.featureText}>AI-powered chat assistant</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="check-circle" size={Responsive.fontSize[20]} color={Colors.status.success} />
            <Text style={styles.featureText}>Real-time showtime updates</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="check-circle" size={Responsive.fontSize[20]} color={Colors.status.success} />
            <Text style={styles.featureText}>Secure payment options</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Text style={styles.text}>Email: support@moviebot.com</Text>
          <Text style={styles.text}>Phone: +1 800 123 4567</Text>
          <Text style={styles.text}>Address: 123 Cinema Street, Movie City, MC 12345</Text>
        </View>

        <View style={{ height: insets.bottom + Responsive.spacing[20] }} />
      </ScrollView>
    </View>
  )
}

export default AboutUsScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Responsive.spacing[20],
    paddingBottom: Responsive.spacing[15],
    backgroundColor: Colors.primary,
  },
  backButton: {
    width: Responsive.spacing[40],
  },
  headerTitle: {
    fontSize: Responsive.fontSize[20],
    fontWeight: 'bold',
    color: Colors.text.inverse,
  },
  content: {
    flex: 1,
    paddingHorizontal: Responsive.spacing[20],
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: Responsive.padding[40],
  },
  appName: {
    fontSize: Responsive.fontSize[28],
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: Responsive.spacing[15],
  },
  version: {
    fontSize: Responsive.fontSize[14],
    color: Colors.text.secondary,
    marginTop: Responsive.spacing[5],
  },
  section: {
    marginBottom: Responsive.spacing[30],
  },
  sectionTitle: {
    fontSize: Responsive.fontSize[18],
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Responsive.spacing[12],
  },
  text: {
    fontSize: Responsive.fontSize[15],
    color: Colors.text.secondary,
    lineHeight: 24,
    marginBottom: Responsive.spacing[8],
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Responsive.spacing[12],
  },
  featureText: {
    fontSize: Responsive.fontSize[15],
    color: Colors.text.primary,
    marginLeft: Responsive.spacing[12],
  },
})
