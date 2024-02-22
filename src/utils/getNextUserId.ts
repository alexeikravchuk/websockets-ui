export const getNextUserId = (() => {
  let nextId = 0;
  return () => nextId++;
})();