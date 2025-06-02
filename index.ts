import { registerRootComponent } from 'expo';
import App from './App';
import { initializeStagewise } from './src/StagewiseDevTool';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

// 初始化 Stagewise 工具栏 (仅在 web 开发模式下)
initializeStagewise();
