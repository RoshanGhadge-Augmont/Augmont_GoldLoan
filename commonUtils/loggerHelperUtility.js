import { ICONS } from "../commonUtils/icons";

export const logger = {
  start: (message) => {
    console.info(`${ICONS.START} ${message}`);
  },

  success: (message) => {
    console.info(`${ICONS.SUCCESS} ${message}`);
  },

  error: (message) => {
    console.error(`${ICONS.ERROR} ${message}`);
  },

  warning: (message) => {
    console.warn(`${ICONS.WARNING} ${message}`);
  },

  info: (message) => {
    console.info(`${ICONS.INFO} ${message}`);
  },
};
