import React, { useMemo } from 'react'
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import LinearGradient from 'react-native-linear-gradient'
import Skeleton from 'react-native-reanimated-skeleton'
import { Colors } from '../utilities/AppTheme'
import { Responsive } from '../utilities/Responsive'

const HomeSkeletonLoader = () => {
  const insets = useSafeAreaInsets()

  const layout = useMemo(
    () => [
      // Header row
      {
        key: 'headerRow',
        marginTop: insets.top + Responsive.spacing[5],
        marginHorizontal: Responsive.spacing[20],
        marginBottom: Responsive.spacing[8],
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        children: [
          {
            key: 'headerLeft',
            children: [
              {
                key: 'cityRow',
                width: Responsive.size.wp(30),
                height: Responsive.size.hp(2),
                borderRadius: Responsive.radius[10],
                marginBottom: Responsive.spacing[8],
              },
              {
                key: 'titleRow',
                width: Responsive.size.wp(38),
                height: Responsive.size.hp(3.4),
                borderRadius: Responsive.radius[10],
              },
            ],
          },
          {
            key: 'avatar',
            width: Responsive.size.wp(30),
            height: Responsive.size.wp(28),
            borderRadius: Responsive.radius[20],
          },
        ],
      },
      // Search
      {
        key: 'search',
        marginHorizontal: Responsive.spacing[20],
        marginBottom: Responsive.spacing[15],
        width: Responsive.size.wp(89.5),
        height: Responsive.size.hp(5.5),
        borderRadius: Responsive.radius[25],
      },
      // Promo banners
      {
        key: 'promoSection',
        marginHorizontal: Responsive.spacing[20],
        marginBottom: Responsive.spacing[15],
        flexDirection: 'row',
        children: [
          {
            key: 'promo1',
            width: Responsive.size.wp(70),
            height: Responsive.size.hp(8),
            borderRadius: Responsive.radius[12],
            marginRight: Responsive.spacing[15],
          },
          {
            key: 'promo2',
            width: Responsive.size.wp(22),
            height: Responsive.size.hp(8),
            borderRadius: Responsive.radius[12],
          },
        ],
      },
      // Genre chips
      {
        key: 'chips',
        marginHorizontal: Responsive.spacing[20],
        marginBottom: Responsive.spacing[20],
        flexDirection: 'row',
        children: [
          { key: 'chip1', width: Responsive.size.wp(20), height: Responsive.size.hp(4.2), borderRadius: Responsive.radius[20], marginRight: Responsive.spacing[10] },
          { key: 'chip2', width: Responsive.size.wp(18), height: Responsive.size.hp(4.2), borderRadius: Responsive.radius[20], marginRight: Responsive.spacing[10] },
          { key: 'chip3', width: Responsive.size.wp(20), height: Responsive.size.hp(4.2), borderRadius: Responsive.radius[20], marginRight: Responsive.spacing[10] },
          { key: 'chip4', width: Responsive.size.wp(18), height: Responsive.size.hp(4.2), borderRadius: Responsive.radius[20] },
        ],
      },
      // Now showing header
      {
        key: 'nowHeader',
        marginHorizontal: Responsive.spacing[20],
        marginTop: Responsive.spacing[5],
        marginBottom: Responsive.spacing[5],
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        children: [
          { key: 'nowTitle', width: Responsive.size.wp(36), height: Responsive.size.hp(2.8), borderRadius: Responsive.radius[8] },
          { key: 'seeAll', width: Responsive.size.wp(16), height: Responsive.size.hp(2), borderRadius: Responsive.radius[8] },
        ],
      },
      // Carousel placeholder
      {
        key: 'carousel',
        marginHorizontal: Responsive.spacing[20],
        marginBottom: Responsive.spacing[15],
        width: Responsive.size.wp(89.5),
        height: Responsive.size.hp(22),
        borderRadius: Responsive.radius[12],
      },
      // Grid cards
      {
        key: 'grid',
        marginHorizontal: Responsive.spacing[20],
        marginBottom: Responsive.spacing[20],
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        children: [
          { key: 'movie1', width: '48%', height: Responsive.size.hp(28), borderRadius: Responsive.radius[12], marginBottom: Responsive.spacing[15] },
          { key: 'movie2', width: '48%', height: Responsive.size.hp(28), borderRadius: Responsive.radius[12], marginBottom: Responsive.spacing[15] },
          { key: 'movie3', width: '48%', height: Responsive.size.hp(28), borderRadius: Responsive.radius[12] },
          { key: 'movie4', width: '48%', height: Responsive.size.hp(28), borderRadius: Responsive.radius[12] },
        ],
      },
      // Coming soon header
      {
        key: 'comingHeader',
        marginHorizontal: Responsive.spacing[20],
        marginTop: Responsive.spacing[5],
        marginBottom: Responsive.spacing[10],
        width: Responsive.size.wp(36),
        height: Responsive.size.hp(2.8),
        borderRadius: Responsive.radius[8],
      },
      // Coming soon list
      {
        key: 'comingList',
        marginHorizontal: Responsive.spacing[20],
        marginBottom: Responsive.spacing[20],
        flexDirection: 'row',
        children: [
          { key: 'coming1', width: Responsive.size.wp(40), height: Responsive.size.hp(30), borderRadius: Responsive.radius[12], marginRight: Responsive.spacing[15] },
          { key: 'coming2', width: Responsive.size.wp(40), height: Responsive.size.hp(30), borderRadius: Responsive.radius[12] },
        ],
      },
      // Quick actions header
      {
        key: 'actionsHeader',
        marginHorizontal: Responsive.spacing[20],
        marginTop: Responsive.spacing[5],
        marginBottom: Responsive.spacing[10],
        width: Responsive.size.wp(34),
        height: Responsive.size.hp(2.8),
        borderRadius: Responsive.radius[8],
      },
      // Action cards
      {
        key: 'actions',
        marginHorizontal: Responsive.spacing[20],
        marginBottom: insets.bottom + Responsive.spacing[100],
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        children: [
          { key: 'action1', width: '48%', height: Responsive.size.hp(14), borderRadius: Responsive.radius[12], marginBottom: Responsive.spacing[15] },
          { key: 'action2', width: '48%', height: Responsive.size.hp(14), borderRadius: Responsive.radius[12], marginBottom: Responsive.spacing[15] },
        ],
      },
    ],
    [insets.bottom, insets.top],
  )

  return (
    <LinearGradient colors={Colors.gradient.cinema} style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Skeleton
          isLoading={true}
          layout={layout}
          containerStyle={styles.skeletonContainer}
          animationType='shiver'
          boneColor={Colors.surface}
          highlightColor={'gray'}
          animationDirection='horizontalRight'
        />
      </ScrollView>
    </LinearGradient>
  )
}

export default HomeSkeletonLoader

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  skeletonContainer: {
    flex: 1,
  },
})
