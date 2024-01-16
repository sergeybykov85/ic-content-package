module.exports = function override(config, env) {
  config.resolve.fallback = {
    crypto: false,
    stream: false,
    assert: false,
  }
  return config
}
