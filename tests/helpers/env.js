export function createMockEnv(initialValues = {}) {
  const store = new Map(
    Object.entries(initialValues).map(([key, value]) => [
      key,
      typeof value === 'string' ? value : JSON.stringify(value)
    ])
  );
  const writes = [];

  return {
    env: {
      SUBSCRIPTIONS_KV: {
        async get(key, options = {}) {
          const value = store.has(key) ? store.get(key) : null;
          if (value === null || value === undefined) return null;
          if (options.type === 'json') {
            return JSON.parse(value);
          }
          return value;
        },
        async put(key, value, options = {}) {
          store.set(key, value);
          writes.push({ key, value, options });
        }
      }
    },
    store,
    writes
  };
}

export function readStoredJson(store, key) {
  const value = store.get(key);
  return value ? JSON.parse(value) : null;
}
