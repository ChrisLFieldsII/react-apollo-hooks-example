// I just store all utils in one gigantic file :D
import { Dimensions } from 'react-native';


export const getWidth = () => Dimensions.get('window').width;
export const getHeight = () => Dimensions.get('window').height;

export const noop = () => null;

export const COLORS = {
  BLUE: 'rgb(0, 123, 255)',
  RED: '#dc3545',
}