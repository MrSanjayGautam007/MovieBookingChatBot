import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import Feather from 'react-native-vector-icons/Feather'
import { Responsive } from '../utilities/Responsive'
import { Colors } from '../utilities/AppTheme'

const PrivacyPolicyScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={[styles.header, { paddingTop: insets.top + Responsive.spacing[15] }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={Responsive.fontSize[24]} color={Colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <Text style={styles.lastUpdated}>Last Updated: January 2024</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.text}>
            We collect information you provide directly to us, including:
          </Text>
          <Text style={styles.bulletText}>• Name, email address, and phone number</Text>
          <Text style={styles.bulletText}>• Payment information for ticket purchases</Text>
          <Text style={styles.bulletText}>• Booking history and preferences</Text>
          <Text style={styles.bulletText}>• Device information and usage data</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.text}>
            We use the information we collect to:
          </Text>
          <Text style={styles.bulletText}>• Process your ticket bookings and payments</Text>
          <Text style={styles.bulletText}>• Send booking confirmations and updates</Text>
          <Text style={styles.bulletText}>• Improve our services and user experience</Text>
          <Text style={styles.bulletText}>• Provide customer support</Text>
          <Text style={styles.bulletText}>• Send promotional offers (with your consent)</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Information Sharing</Text>
          <Text style={styles.text}>
            We do not sell your personal information. We may share your information with:
          </Text>
          <Text style={styles.bulletText}>• Theater partners to fulfill bookings</Text>
          <Text style={styles.bulletText}>• Payment processors for transactions</Text>
          <Text style={styles.bulletText}>• Service providers who assist our operations</Text>
          <Text style={styles.bulletText}>• Law enforcement when required by law</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Data Security</Text>
          <Text style={styles.text}>
            We implement appropriate security measures to protect your personal information. 
            However, no method of transmission over the internet is 100% secure.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Your Rights</Text>
          <Text style={styles.text}>
            You have the right to:
          </Text>
          <Text style={styles.bulletText}>• Access your personal information</Text>
          <Text style={styles.bulletText}>• Correct inaccurate data</Text>
          <Text style={styles.bulletText}>• Request deletion of your data</Text>
          <Text style={styles.bulletText}>• Opt-out of marketing communications</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Cookies and Tracking</Text>
          <Text style={styles.text}>
            We use cookies and similar technologies to enhance your experience, analyze usage, 
            and deliver personalized content.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
          <Text style={styles.text}>
            Our service is not intended for children under 13. We do not knowingly collect 
            information from children under 13.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Changes to Privacy Policy</Text>
          <Text style={styles.text}>
            We may update this Privacy Policy from time to time. We will notify you of any 
            changes by posting the new policy on this page.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Contact Us</Text>
          <Text style={styles.text}>
            For privacy-related questions, contact us at privacy@moviebot.com
          </Text>
        </View>

        <View style={{ height: insets.bottom + Responsive.spacing[20] }} />
      </ScrollView>
    </View>
  )
}

export default PrivacyPolicyScreen

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
