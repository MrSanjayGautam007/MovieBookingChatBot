import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({
  id: 'moviebot-local-storage',
});