// models/userModel.js
const prisma = require('./prismaClient');

// cari user berdasarkan username (untuk login)
async function findUserByUsername(username) {
  return prisma.user.findUnique({
    where: { username },
  });
}

// buat user baru
async function createUser(data) {
  return prisma.user.create({
    data, // { username, password, role }
  });
}

// ambil semua user (opsional filter role)
async function getAllUsers(role) {
  return prisma.user.findMany({
    where: role ? { role } : {},
    select: {
      id: true,
      username: true,
      role: true,
    },
  });
}

module.exports = {
  findUserByUsername,
  createUser,
  getAllUsers,
};
