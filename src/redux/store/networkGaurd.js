
import Toast from "react-native-toast-message";
const networkGuardMiddleware = (store) => (next) => (action) => {

    const isAPIRequest = action.type.endsWith('/pending') || action.meta?.arg?.isAPI;

    if (isAPIRequest) {
        const state = store.getState();
        const { isConnected, isInternetReachable } = state.network;

        if (!isConnected || isInternetReachable === false) {
            // console.warn(`Action ${action.type} blocked: No Internet.`);

            Toast.show({
                type: 'error',
                text1: 'Connection Error',
                text2: 'Please check your internet and try again.',
            });
            return;
        }
    }


    return next(action);
};

export default networkGuardMiddleware;