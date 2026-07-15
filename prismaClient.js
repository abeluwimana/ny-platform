const { PrismaClient } = require('@prisma/client');

// Create a single PrismaClient instance with proper options
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

module.exports = prisma;