import { createItem, listItems, getItemById, updateItem, deleteItem } from '../src/services/itemService.js';

describe('itemService', () => {
  test('create and list items', () => {
    const a = createItem({ name: 'A' });
    const b = createItem({ name: 'B' });
    const list = listItems();
    expect(list.length).toBeGreaterThanOrEqual(2);
    expect(list.map(i => i.name)).toEqual(expect.arrayContaining(['A', 'B']));
  });

  test('get, update, delete item', () => {
    const c = createItem({ name: 'C' });
    const got = getItemById(c.id);
    expect(got.name).toBe('C');
    const upd = updateItem(c.id, { name: 'C2' });
    expect(upd.name).toBe('C2');
    const del = deleteItem(c.id);
    expect(del.id).toBe(c.id);
    expect(() => getItemById(c.id)).toThrow('Item not found');
  });
});
