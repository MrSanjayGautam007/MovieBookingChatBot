/**
 * Debug-only logger.
 *
 * `__DEV__` is a global boolean injected by the React Native/Metro
 * bundler — it's `true` in development builds and `false` in
 * release/production builds.
 *
 * Usage:
 *   import { logger } from '../utils/logger';
 *   logger.log('Fetched data:', data);
 */

type LogArgs = unknown[];

const logger = {
  log: (...args: LogArgs): void => {
    if (__DEV__) {
      console.log(...args);
    }
  },
  info: (...args: LogArgs): void => {
    if (__DEV__) {
      console.info(...args);
    }
  },
  warn: (...args: LogArgs): void => {
    if (__DEV__) {
      console.warn(...args);
    }
  },
  error: (...args: LogArgs): void => {
    if (__DEV__) {
      console.error(...args);
    }
  },
};

export default logger;
export { logger };
