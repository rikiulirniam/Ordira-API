import { prisma } from '../models/prismaClient.js';

/**
 * Get all categories
 */
export async function getAllCategories({ includeInactive = false } = {}) {
  const where = includeInactive ? {} : { isActive: true };

  const categories = await prisma.category.findMany({
    where,
    include: {
      _count: {
        select: { menus: true },
      },
    },
    orderBy: { order: 'asc' },
  });

  return categories;
}

/**
 * Get category by ID
 */
export async function getCategoryById(categoryId) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      _count: {
        select: { menus: true },
      },
    },
  });

  if (!category) {
    throw new Error('Category not found');
  }

  return category;
}

/**
 * Create new category
 */
export async function createCategory({ name, description, icon, order, isActive = true }) {
  // Check if category name already exists
  const existingCategory = await prisma.category.findUnique({
    where: { name },
  });

  if (existingCategory) {
    throw new Error('Category name already exists');
  }

  // If no order specified, set to last
  let categoryOrder = order;
  if (categoryOrder === undefined || categoryOrder === null) {
    const lastCategory = await prisma.category.findFirst({
      orderBy: { order: 'desc' },
    });
    categoryOrder = lastCategory ? lastCategory.order + 1 : 0;
  }

  const category = await prisma.category.create({
    data: {
      name,
      description,
      icon,
      order: categoryOrder,
      isActive,
    },
    include: {
      _count: {
        select: { menus: true },
      },
    },
  });

  return category;
}

/**
 * Update category
 */
export async function updateCategory(categoryId, { name, description, icon, order, isActive }) {
  // Check if category exists
  const existingCategory = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!existingCategory) {
    throw new Error('Category not found');
  }

  // Check if name is being changed and if new name exists
  if (name && name !== existingCategory.name) {
    const categoryWithName = await prisma.category.findUnique({
      where: { name },
    });

    if (categoryWithName) {
      throw new Error('Category name already exists');
    }
  }

  const updateData = {};
  
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (icon !== undefined) updateData.icon = icon;
  if (order !== undefined) updateData.order = order;
  if (isActive !== undefined) updateData.isActive = isActive;

  const category = await prisma.category.update({
    where: { id: categoryId },
    data: updateData,
    include: {
      _count: {
        select: { menus: true },
      },
    },
  });

  return category;
}

/**
 * Delete category
 */
export async function deleteCategory(categoryId) {
  // Check if category exists
  const existingCategory = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      _count: {
        select: { menus: true },
      },
    },
  });

  if (!existingCategory) {
    throw new Error('Category not found');
  }

  // Check if category has menus
  if (existingCategory._count.menus > 0) {
    throw new Error('Cannot delete category with existing menus. Please delete or reassign the menus first.');
  }

  await prisma.category.delete({
    where: { id: categoryId },
  });

  return { message: 'Category deleted successfully' };
}

export default {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
