const Lazy = require("lazy-fetch-cache");

test("can initialize Lazy with single fetch method", () => {
  expect(() => {
    Lazy(async () => null);
  }).not.toThrow(/.*/g);
});

test("can read property from proxy", () => {
  const lazy = Lazy(async () => "test value__");
  lazy.asdf().then((v) => expect(v).toBe("test value__"));
});

test("requested name is passed to fetch function", () => {
  const lazy = Lazy(async (name) => {
    expect(name).toBe("asdfasdf");
  });
  lazy.asdfasdf();
});

test("if property is read after it has been fetched once, it will not be fetched again", () => {
  let count = 0;
  const lazy = Lazy(async (name) => count++);
  lazy.asdf().then((a) => {
    lazy.asdf().then(() => {
      expect(count).toBe(1);
    });
  });
});

test("properties are assignable", () => {
  let count = 0;
  const lazy = Lazy(async (name) => count++);

  lazy.asdf = "hello";
  lazy.asdf().then((v) => expect(v).toBe("hello"));
});

test("can initialize Lazy with multiple fetch methods", () => {
  expect(() => {
    Lazy([
      { key: /a/g, fetch: async () => null },
      { key: /b/g, fetch: async () => null },
    ]);
  }).not.toThrow(/.*/g);
});

test("can read property from proxy with multiple fetch methods", () => {
  const lazy = Lazy([
    { key: /a/g, fetch: async () => "_a" },
    { key: /b/g, fetch: async () => "_b" },
  ]);
  lazy.a().then((v) => expect(v).toBe("_a"));
  lazy.b().then((v) => expect(v).toBe("_b"));
});

test("if property is read after it has been fetched it will not be fetched again (proxy with multiple fetch methods", () => {
  let count = 0;
  const lazy = Lazy([{ key: /.*/g, fetch: async () => count++ }]);
  lazy.a().then(() => {
    lazy.a().then(() => {
      expect(count).toBe(1);
    });
  });
});

test("if there is no matching fetch function, an error is thrown", () => {
  const lazy = Lazy([{ key: /a/g, fetch: async () => null }]);
  expect(lazy.b()).rejects.toEqual("No matching fetch function");
});

test("properties are assignable if there are multiple fetch functions", () => {
  const lazy = Lazy([{ key: /.*/g, fetch: async (a) => a }]);
  lazy.asdf = "Hello";
  expect(lazy.asdf()).resolves.toEqual("Hello");
});
