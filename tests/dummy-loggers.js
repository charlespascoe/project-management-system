const dummyLogger = {
  trace: () => undefined,
  debug: () => undefined,
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
  fatal: () => undefined
}

export default new Proxy({}, {
  get: (proxy, name) => dummyLogger
});
