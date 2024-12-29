import react from 'eslint-plugin-react';

export default {
  plugins: {
    react,
  },
  extends: ['plugin:react/recommended'],
  settings: {
    react: {
      version: 'detect', // Automatically detect the React version
    },
  },
};