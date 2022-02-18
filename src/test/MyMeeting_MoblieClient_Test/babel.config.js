module.exports = {
  // See https://babeljs.io/docs/en/babel-preset-env#targets
  presets: [
    'module:metro-react-native-babel-preset', 
  ],
  env: {
    "test": {
      "plugins": ["@babel/plugin-transform-modules-commonjs"]
    }
  }
};