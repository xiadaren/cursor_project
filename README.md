# 学生选课系统（前后端分离）

## 技术栈
- **前端**：React 18 + TypeScript + Vite + Ant Design + Tailwind + Framer Motion + Redux Toolkit/RTK Query
- **后端**：Spring Boot 3 + Spring Security JWT + JPA + Flyway + SpringDoc OpenAPI
- **数据库**：MySQL

## 目录结构
- `frontend/`：前端工程
- `backend/`：后端工程

## 一键启动（推荐：先起 MySQL）

### 1) 启动 MySQL（Docker）
在项目根目录运行：

```bash
docker compose up -d
```

默认会创建：
- DB：`scs`
- 用户：`root`
- 密码：`root`

### 2) 启动后端
```bash
cd backend
./gradlew.bat bootRun
```

- Swagger UI：`http://localhost:8080/swagger-ui/index.html`
- 健康检查：`http://localhost:8080/actuator/health`

默认管理员（首次启动自动创建）：
- `admin@example.com`
- `Admin123`

### 3) 启动前端
```bash
cd frontend
npm install
npm run dev
```

前端默认调用后端：
- `VITE_API_BASE_URL` 未设置时使用 `http://localhost:8080`

如需显式设置，可在 `frontend/.env.local` 中写：

```env
VITE_API_BASE_URL=http://localhost:8080
```

## CSV 导入课程格式（管理员）
后端提供：`POST /api/admin/courses/import`（multipart form-data，字段名 `file`）

CSV 每行字段：
1. `name`
2. `teacherEmail`
3. `credits`
4. `capacity`
5. `dayOfWeek`（1-7，周一=1）
6. `startPeriod`
7. `endPeriod`
8. `location`
9. `schedule`（展示字符串，如“周一3-4节”）
10. `description`（可选）

示例：

```csv
name,teacherEmail,credits,capacity,dayOfWeek,startPeriod,endPeriod,location,schedule,description
高等数学,t1@example.com,4,120,1,1,2,A101,周一1-2节,微积分基础
```

## 测试
- 后端：

```bash
cd backend
./gradlew.bat test
```

- 前端：

```bash
cd frontend
npm test
```

## 安全与配置说明
- `backend/src/main/resources/application.properties` 中的 `app.jwt.secret` **请务必替换为更长的随机字符串**。
- 当前 refresh token 采用数据库存储与轮换（rotate），access token 为 JWT。

