import React from 'react';
import { Text as RNText, TextStyle } from 'react-native';

// TypeScript type for props
interface TextProps {
  children: React.ReactNode;
  style?: TextStyle; // Optional style prop
}

// Custom Text component
const Text: React.FC<TextProps> = ({ children, style }) => {
  return <RNText style={style}>{children}</RNText>;
};

export default Text;
