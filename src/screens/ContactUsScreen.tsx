import React, { useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView, TextInput } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Feather from 'react-native-vector-icons/Feather'
import { Responsive } from '../utilities/Responsive'
import { Colors } from '../utilities/AppTheme'

const ContactUsScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = () => {
    // Submit logic here
    console.log({ name, email, subject, message })
  }

  const contactMethods = [
    { id: 1, icon: 'email', title: 'Email', value: 'support@moviebot.com', color: '#4ECDC4' },
    { id: 2, icon: 'phone', title: 'Phone', value: '+1 800 123 4567', color: '#45B7D1' },
    { id: 3, icon: 'location-on', title: 'Address', value: '123 Cinema St, Movie City', color: '#96CEB4' },
  ]

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={[styles.header, { paddingTop: insets.top + Responsive.spacing[15] }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={Responsive.fontSize[24]} color={Colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Contact Methods */}
        <View style={styles.methodsContainer}>
          {contactMethods.map((method) => (
            <View key={method.id} style={styles.methodCard}>
              <View style={[styles.methodIcon, { backgroundColor: `${method.color}20` }]}>
                <MaterialIcons name={method.icon} size={Responsive.fontSize[24]} color={method.color} />
              </View>
              <Text style={styles.methodTitle}>{method.title}</Text>
              <Text style={styles.methodValue}>{method.value}</Text>
            </View>
          ))}
        </View>

        {/* Contact Form */}
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Send us a Message</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={Colors.text.disabled}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your.email@example.com"
              placeholderTextColor={Colors.text.disabled}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Subject</Text>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder="What is this about?"
              placeholderTextColor={Colors.text.disabled}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={message}
              onChangeText={setMessage}
              placeholder="Your message..."
              placeholderTextColor={Colors.text.disabled}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.8}>
            <Text style={styles.submitText}>Send Message</Text>
            <MaterialIcons name="send" size={Responsive.fontSize[20]} color={Colors.text.inverse} />
          </TouchableOpacity>
        </View>

        <View style={{ height: insets.bottom + Responsive.spacing[20] }} />
      </ScrollView>
    </View>
  )
}

export default ContactUsScreen

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
  methodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Responsive.spacing[20],
    marginBottom: Responsive.spacing[30],
  },
  methodCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Responsive.padding[15],
    borderRadius: Responsive.radius[12],
    marginHorizontal: Responsive.spacing[5],
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  methodIcon: {
    width: Responsive.size.wp(12),
    height: Responsive.size.wp(12),
    borderRadius: Responsive.size.wp(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Responsive.spacing[10],
  },
  methodTitle: {
    fontSize: Responsive.fontSize[12],
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Responsive.spacing[5],
  },
  methodValue: {
    fontSize: Responsive.fontSize[10],
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: Responsive.spacing[20],
  },
  formTitle: {
    fontSize: Responsive.fontSize[18],
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Responsive.spacing[20],
  },
  inputGroup: {
    marginBottom: Responsive.spacing[20],
  },
  label: {
    fontSize: Responsive.fontSize[14],
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Responsive.spacing[8],
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.radius[12],
    paddingHorizontal: Responsive.padding[15],
    paddingVertical: Responsive.padding[12],
    fontSize: Responsive.fontSize[15],
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  textArea: {
    height: Responsive.size.hp(15),
    paddingTop: Responsive.padding[12],
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Responsive.padding[15],
    borderRadius: Responsive.radius[12],
    marginTop: Responsive.spacing[10],
  },
  submitText: {
    fontSize: Responsive.fontSize[16],
    fontWeight: '600',
    color: Colors.text.inverse,
    marginRight: Responsive.spacing[10],
  },
})
