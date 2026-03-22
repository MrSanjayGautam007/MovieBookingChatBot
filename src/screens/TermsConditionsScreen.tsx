import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import Feather from 'react-native-vector-icons/Feather'
import { Responsive } from '../utilities/Responsive'
import { Colors } from '../utilities/AppTheme'

const TermsConditionsScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={[styles.header, { paddingTop: insets.top + Responsive.spacing[15] }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={Responsive.fontSize[24]} color={Colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: January 2024</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.text}>
            By accessing and using MovieBot, you accept and agree to be bound by the terms and provision of this agreement.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Use of Service</Text>
          <Text style={styles.text}>
            You agree to use MovieBot only for lawful purposes and in accordance with these Terms. You must not use our service:
          </Text>
          <Text style={styles.bulletText}>• In any way that violates applicable laws</Text>
          <Text style={styles.bulletText}>• To transmit harmful or malicious code</Text>
          <Text style={styles.bulletText}>• To impersonate or attempt to impersonate others</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Booking and Payments</Text>
          <Text style={styles.text}>
            All bookings are subject to availability. Payment must be completed at the time of booking. 
            Cancellation policies vary by theater and are displayed during booking.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. User Account</Text>
          <Text style={styles.text}>
            You are responsible for maintaining the confidentiality of your account credentials. 
            You agree to accept responsibility for all activities that occur under your account.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Refunds and Cancellations</Text>
          <Text style={styles.text}>
            Refund eligibility depends on the theater's policy and timing of cancellation. 
            Cancellations made within 2 hours of showtime may not be eligible for refunds.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
          <Text style={styles.text}>
            MovieBot shall not be liable for any indirect, incidental, special, consequential or punitive damages 
            resulting from your use of or inability to use the service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Changes to Terms</Text>
          <Text style={styles.text}>
            We reserve the right to modify these terms at any time. Continued use of the service after changes 
            constitutes acceptance of the modified terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Contact Us</Text>
          <Text style={styles.text}>
            If you have questions about these Terms, please contact us at legal@moviebot.com
          </Text>
        </View>

        <View style={{ height: insets.bottom + Responsive.spacing[20] }} />
      </ScrollView>
    </View>
  )
}

export default TermsConditionsScreen

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
  lastUpdated: {
    fontSize: Responsive.fontSize[12],
    color: Colors.text.secondary,
    marginTop: Responsive.spacing[20],
    marginBottom: Responsive.spacing[10],
    fontStyle: 'italic',
  },
  section: {
    marginBottom: Responsive.spacing[25],
  },
  sectionTitle: {
    fontSize: Responsive.fontSize[16],
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Responsive.spacing[10],
  },
  text: {
    fontSize: Responsive.fontSize[14],
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  bulletText: {
    fontSize: Responsive.fontSize[14],
    color: Colors.text.secondary,
    lineHeight: 22,
    marginLeft: Responsive.spacing[10],
    marginTop: Responsive.spacing[5],
  },
})
