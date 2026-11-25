const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

if (!config.resolver.sourceExts.includes('cjs')) {
  config.resolver.sourceExts.push('cjs');
}

// Keep package exports enabled for React Native 0.88+ while preventing the
// @firebase/component & @firebase/logger CJS+ESM dual-package hazard in Metro,
// which otherwise throws "Component auth has not been registered yet" in Expo Go.
const SINGLETON_CJS_PACKAGES = {
  '@firebase/component': path.resolve(__dirname, 'node_modules/@firebase/component/dist/index.cjs.js'),
  '@firebase/logger': path.resolve(__dirname, 'node_modules/@firebase/logger/dist/index.cjs.js'),
};

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (SINGLETON_CJS_PACKAGES[moduleName]) {
    return {
      filePath: SINGLETON_CJS_PACKAGES[moduleName],
      type: 'sourceFile',
    };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
