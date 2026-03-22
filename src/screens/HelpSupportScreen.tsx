import React, { useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Feather from 'react-native-vector-icons/Feather'
import { Responsive } from '../utilities/Responsive'
import { Colors } from '../utilities/AppTheme'

const HelpSupportScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const faqs = [
    {
      id: 1,
      question: 'How do I book a movie ticket?',
      answer: 'You can book tickets by browsing movies, selecting showtime, choosing seats, and completing payment.',
    },
    {
      id: 2,
      question: 'Can I cancel my booking?',
      answer: 'Yes, you can cancel bookings up to 2 hours before showtime from My Bookings section.',
    },
    {
      id: 3,
      question: 'What payment methods are accepted?',
      answer: 'We accept credit/debit cards, UPI, net banking, and digital wallets.',
    },
    {
      id: 4,
      question: 'How do I get my tickets?',
      answer: 'Tickets are sent via email and available in My Bookings. Show the QR code at the theater.',
    },
  ]

  const contactOptions = [
    { id: 1, title: 'Email Us', subtitle: 'support@moviebot.com', icon: 'email', color: '#4ECDC4' },
    { id: 2, title: 'Call Us', subtitle: '+1 800 123 4567', icon: 'phone', color: '#45B7D1' },
    // { id: 3, title: 'Live Chat', subtitle: 'Chat with support', icon: 'chat', color: '#96CEB4' },
  ]

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Responsive.spacing[15] }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={Responsive.fontSize[24]} color={Colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          {contactOptions.map((option) => (
            <TouchableOpacity key={option.id} style={styles.contactCard} activeOpacity={0.7}>
              <View style={[styles.contactIcon, { backgroundColor: `${option.color}20` }]}>
                <MaterialIcons name={option.icon} size={Responsive.fontSize[24]} color={option.color} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>{option.title}</Text>
                <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
              </View>
              <Feather name="chevron-right" size={Responsive.fontSize[20]} color={Colors.text.secondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq) => (
            <TouchableOpacity
              key={faq.id}
              style={styles.faqCard}
              onPress={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <MaterialIcons
                  name={expandedFaq === faq.id ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={Responsive.fontSize[24]}
                  color={Colors.text.secondary}
                />
              </View>
              {expandedFaq === faq.id && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: insets.bottom + Responsive.spacing[20] }} />
      </ScrollView>
    </View>
  )
}

export default HelpSupportScreen

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
  section: {
    marginTop: Responsive.spacing[25],
  },
  sectionTitle: {
    fontSize: Responsive.fontSize[18],
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Responsive.spacing[15],
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Responsive.padding[15],
    borderRadius: Responsive.radius[12],
    marginBottom: Responsive.spacing[10],
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contactIcon: {
    width: Responsive.size.wp(12),
    height: Responsive.size.wp(12),
    borderRadius: Responsive.size.wp(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Responsive.spacing[15],
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: Responsive.fontSize[16],
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Responsive.spacing[4],
  },
  contactSubtitle: {
    fontSize: Responsive.fontSize[14],
    color: Colors.text.secondary,
  },
  faqCard: {
    backgroundColor: Colors.surface,
    padding: Responsive.padding[15],
    borderRadius: Responsive.radius[12],
    marginBottom: Responsive.spacing[10],
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: Responsive.fontSize[15],
    fontWeight: '600',
    color: Colors.text.primary,
  },
  faqAnswer: {
    fontSize: Responsive.fontSize[14],
    color: Colors.text.secondary,
    marginTop: Responsive.spacing[10],
    lineHeight: 20,
  },
})
