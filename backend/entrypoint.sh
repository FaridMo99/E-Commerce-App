#!/bin/sh

echo "Running migrations..."
npx prisma migrate deploy --schema ./prisma/schema.prisma

echo "Starting application..."
exec node dist/app.js