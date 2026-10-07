/** Owns cached IPC data; late loads cannot overwrite a newer refresh. */
export default function createListStore<T>(fetchList: () => Promise<T[]>, onChange: () => void = () => undefined) {
  let list: T[] = [];
  let generation = 0;
  return {
    getSnapshot: () => list,
    async load() {
      generation += 1;
      const current = generation;
      try {
        const result = await fetchList();
        if (current === generation) {
          list = result;
          onChange();
        }
      } catch (error) {
        if (current === generation) throw error;
      }
      return list;
    },
  };
}
