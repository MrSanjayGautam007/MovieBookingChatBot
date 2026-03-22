import { useEffect } from "react";
import { Platform } from "react-native";
import changeNavigationBarColor from "react-native-navigation-bar-color";

const ScreenWrapper = ({ children }) => {
    useEffect(() => {
        if (Platform.OS === 'android') {
            changeNavigationBarColor('transparent', true); // true = light icons
        }
    }, []);

    return <>{children}</>;
};
export default ScreenWrapper