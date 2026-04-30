# Mortar Storefront + Backoffice

โปรเจกต์นี้ถูกปรับจาก Vite landing page เดิมให้เป็น full-stack app ใน repo เดียว ประกอบด้วย:

- `src/` React storefront + backoffice
- `server/` Express API, PostgreSQL access, PASETO auth, Google login endpoint
- `server/db/schema.sql` SQL schema สำหรับสร้างตารางทั้งหมด

## Features

- หน้า storefront ดึงข้อมูลจาก API จริง
- หน้า backoffice สำหรับจัดการข้อมูลทั้งหมดที่แสดงบน storefront
- Login ด้วย `username/password` โดยใช้ PASETO
- Google Login แบบ env-driven (`GOOGLE_CLIENT_ID`, `VITE_GOOGLE_CLIENT_ID`)
- PostgreSQL config จาก env
- seed ข้อมูลเริ่มต้นจาก content เดิมใน `src/App.tsx`

## Environment

ไฟล์ตัวอย่างอยู่ที่ `.env.example`

ค่าที่ใช้งานในเครื่องนี้ถูกใส่ไว้ใน `.env` แล้ว และ `.env` ถูก ignore ไว้ไม่ให้ commit โดยอัตโนมัติ

ตัวแปรหลัก:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_SSL`
- `PASETO_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_DISPLAY_NAME`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_ALLOWED_EMAILS`
- `VITE_API_URL`
- `VITE_GOOGLE_CLIENT_ID`

## Scripts

- `npm run dev` รัน frontend + backend พร้อมกัน
- `npm run dev:client` รัน Vite frontend
- `npm run dev:server` รัน Express API แบบ watch mode
- `npm run db:setup` สร้าง schema และ seed ข้อมูล
- `npm run typecheck` ตรวจ TypeScript ทั้ง frontend/backend
- `npm test` รัน Vitest
- `npm run build` build production frontend

## Notes

- backoffice route คือ `/backoffice`
- login route คือ `/backoffice/login`
- API health check คือ `/api/health`
- schema จะถูก initialize อัตโนมัติเมื่อ backend start
- ใน environment นี้การเชื่อมต่อฐานข้อมูลที่ host ตาม env เกิด `ETIMEDOUT` ระหว่างรัน `npm run db:setup` จึงมี schema/seed script เตรียมไว้ครบ แต่ยังต้องรันจาก network ที่เข้าถึง Supabase instance ได้
