// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
module.exports = function override(config) {
  config.resolve.fallback = {
    crypto: false,
    stream: false,
    assert: false,
  }
  return config
}
