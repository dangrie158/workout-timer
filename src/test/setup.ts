import '@testing-library/jest-dom'

// Ensure localStorage is available in jsdom
if (!global.localStorage) {
  const storage: Record<string, string> = {};
  global.localStorage = {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => {
      storage[key] = value;
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
    clear: () => {
      for (const key in storage) {
        delete storage[key];
      }
    },
    key: (index: number) => Object.keys(storage)[index] || null,
    length: Object.keys(storage).length,
  } as Storage;
}

