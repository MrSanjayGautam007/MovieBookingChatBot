// src/theme/responsive.ts

import { moderateScale } from 'react-native-size-matters';
import {
    widthPercentageToDP,
    heightPercentageToDP,
} from 'react-native-responsive-screen';

/* ---------------------------------- */
/* Type definitions */
/* ---------------------------------- */

type ScaleMap = Record<number, number>;

interface ResponsiveSize {
    wp: (value: number) => number;
    hp: (value: number) => number;
}

export interface ResponsiveHelper {
    spacing: ScaleMap;
    padding: ScaleMap;
    radius: ScaleMap;
    fontSize: ScaleMap;
    size: ResponsiveSize;
}

/* ---------------------------------- */
/* Generator (1 → 100) */
/* ---------------------------------- */

const generateScale = (): ScaleMap => {
    const map: ScaleMap = {};
    for (let i = 1; i <= 100; i++) {
        map[i] = moderateScale(i);
    }
    return map;
};

/* ---------------------------------- */
/* Final export */
/* ---------------------------------- */

export const Responsive: ResponsiveHelper = {
    spacing: generateScale(),
    padding: generateScale(),
    radius: generateScale(),
    fontSize: generateScale(),

    size: {
        wp: (value: number) => widthPercentageToDP(value),
        hp: (value: number) => heightPercentageToDP(value),
    },
};
