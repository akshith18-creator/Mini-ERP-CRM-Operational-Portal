import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`🚀 Mini ERP + CRM Server running in [${env.NODE_ENV}] mode on port ${PORT}`);
});

const gracefulShutdown = async () => {
  console.log('Shutting down server gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Database connection closed. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
