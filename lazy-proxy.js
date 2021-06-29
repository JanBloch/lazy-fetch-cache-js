const Lazy = (__fetch) => {
  if (__fetch instanceof Function) {
    return new Proxy(
      {},
      {
        get: (target, prop, receiver) => {
          return async function () {
            return new Promise((resolve) => {
              if (target[prop] != undefined) {
                resolve(target[prop]);
              } else {
                __fetch(prop).then((v) => {
                  target[prop] = v;
                  resolve(v);
                });
              }
            });
          };
        },
        set: (target, prop, value) => {
          target[prop] = value;
        },
      }
    );
  } else return lazyList(__fetch);
};

const lazyList = (fetchList) => {
  return new Proxy(
    {},
    {
      get: (target, prop, receiver) => {
        return async function () {
          return new Promise((resolve, reject) => {
            if (target[prop] != undefined) {
              resolve(target[prop]);
            } else {
              let fetchFunction;
              for (let i = 0; i < fetchList.length; i++) {
                const { key, fetch } = fetchList[i];
                if (prop.match(key)) {
                  fetchFunction = fetch;
                  break;
                }
              }
              if (!fetchFunction) reject("No matching fetch function");
              fetchFunction(prop).then((v) => {
                target[prop] = v;
                resolve(v);
              });
            }
          });
        };
      },
      set: (target, prop, value) => {
        target[prop] = value;
      },
    }
  );
};

module.exports = Lazy;
