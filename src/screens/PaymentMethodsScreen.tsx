import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Feather from 'react-native-vector-icons/Feather'
import { Responsive } from '../utilities/Responsive'
import { Colors } from '../utilities/AppTheme'

const PaymentMethodsScreen = () => {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()

  const paymentMethods = [
    { id: 1, type: 'Visa', last4: '4242', expiry: '12/25' },
    { id: 2, type: 'Mastercard', last4: '8888', expiry: '06/26' },
  ]

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={[styles.header, { paddingTop: insets.top + Responsive.spacing[15] }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={Responsive.fontSize[24]} color={Colors.text.inverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: Responsive.spacing[40] }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {paymentMethods.map((method) => (
          <View key={method.id} style={styles.card}>
            <MaterialIcons name="credit-card" size={Responsive.fontSize[32]} color={Colors.primary} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardType}>{method.type} •••• {method.last4}</Text>
              <Text style={styles.cardExpiry}>Expires {method.expiry}</Text>
            </View>
            <TouchableOpacity>
              <MaterialIcons name="delete" size={Responsive.fontSize[24]} color={Colors.status.error} />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
          <MaterialIcons name="add" size={Responsive.fontSize[24]} color={Colors.primary} />
          <Text style={styles.addText}>Add New Card</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

export default PaymentMethodsScreen

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Responsive.spacing[20], paddingBottom: Responsive.spacing[15], backgroundColor: Colors.primary },
  headerTitle: { fontSize: Responsive.fontSize[20], fontWeight: 'bold', color: Colors.text.inverse },
  content: { flex: 1, paddingHorizontal: Responsive.spacing[20], paddingTop: Responsive.spacing[20] },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Responsive.radius[12], padding: Responsive.padding[15], marginBottom: Responsive.spacing[15], elevation: 2, shadowColor: Colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  cardInfo: { flex: 1, marginLeft: Responsive.spacing[15] },
  cardType: { fontSize: Responsive.fontSize[16], fontWeight: '600', color: Colors.text.primary, marginBottom: Responsive.spacing[4] },
  cardExpiry: { fontSize: Responsive.fontSize[13], color: Colors.text.secondary },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Responsive.padding[15], borderRadius: Responsive.radius[12], borderWidth: 1, borderColor: Colors.primary, borderStyle: 'dashed' },
  addText: { fontSize: Responsive.fontSize[16], color: Colors.primary, fontWeight: '600', marginLeft: Responsive.spacing[10] },
})
