import { prisma } from '../models/prismaClient.js';

/**
 * Get all menus
 */
export async function getAllMenus({ includeUnavailable = false, categoryId } = {}) {
  const where = {};
  
  if (!includeUnavailable) {
    where.isAvailable = true;
  }
  
  if (categoryId) {
    where.categoryId = categoryId;
  }

  const menus = await prisma.menu.findMany({
    where,
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return menus;
}

/**
 * Get menu by ID
 */
export async function getMenuById(menuId) {
  const menu = await prisma.menu.findUnique({
    where: { id: menuId },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!menu) {
    throw new Error('Menu not found');
  }

  return menu;
}

/**
 * Create new menu
 */
export async function createMenu({ name, price, description, image, categoryId, isAvailable = true }) {
  // Check if category exists
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new Error('Category not found');
  }

  const menu = await prisma.menu.create({
    data: {
      name,
      price,
      description,
      image,
      categoryId,
      isAvailable,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return menu;
}

/**
 * Update menu
 */
export async function updateMenu(menuId, { name, price, description, image, categoryId, isAvailable }) {
  // Check if menu exists
  const existingMenu = await prisma.menu.findUnique({
    where: { id: menuId },
  });

  if (!existingMenu) {
    throw new Error('Menu not found');
  }

  // If categoryId is provided, check if it exists
  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new Error('Category not found');
    }
  }

  const updateData = {};
  
  if (name !== undefined) updateData.name = name;
  if (price !== undefined) updateData.price = price;
  if (description !== undefined) updateData.description = description;
  if (image !== undefined) updateData.image = image;
  if (categoryId !== undefined) updateData.categoryId = categoryId;
  if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

  const menu = await prisma.menu.update({
    where: { id: menuId },
    data: updateData,
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return menu;
}

/**
 * Delete menu
 */
export async function deleteMenu(menuId) {
  // Check if menu exists
  const existingMenu = await prisma.menu.findUnique({
    where: { id: menuId },
  });

  if (!existingMenu) {
    throw new Error('Menu not found');
  }

  // Check if menu has order items
  const orderItems = await prisma.orderItem.findFirst({
    where: { menuId },
  });

  if (orderItems) {
    throw new Error('Cannot delete menu that has been ordered. Consider marking it as unavailable instead.');
  }

  await prisma.menu.delete({
    where: { id: menuId },
  });

  return { message: 'Menu deleted successfully' };
}

export default {
  getAllMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
};
