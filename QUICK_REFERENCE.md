# IDURAR ERP CRM - Quick Reference Guide

## 🚀 Getting Started (5 Minutes)

### 1. Start Application
```powershell
# Start backend and frontend
docker-compose up -d

# View logs
docker-compose logs -f
```

**Access URLs:**
- Frontend: http://localhost:80
- Backend API: http://localhost:8888
- Login: `admin@admin.com` / `admin123`

### 2. Run Tests
```powershell
# Backend tests
cd backend/tests; npm install; npm test

# Frontend tests  
cd tests; npm install; npm test

# Performance tests
k6 run tests/performance/load-test.js
```

### 3. Stop Application
```powershell
docker-compose down
```

---

## 📋 Essential Commands

### Development

```powershell
# Backend dev server
cd backend; npm run dev

# Frontend dev server
cd frontend; npm run dev

# Database setup
cd backend; npm run setup
```

### Docker

```powershell
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Stop services
docker-compose down

# Remove everything
docker-compose down -v
```

### Testing

```powershell
# All backend tests
cd backend/tests; npm test

# Watch mode
npm test -- --watch

# With coverage
npm test -- --coverage

# Cypress UI tests
cd tests; npm run test:open

# Cypress headless
npm test

# Performance tests
k6 run tests/performance/load-test.js
```

### Deployment

```powershell
# Push to trigger CI/CD
git add .
git commit -m "Deploy to production"
git push origin master

# Manual Docker deploy
docker build -t backend:latest backend/
docker build -t frontend:latest frontend/
docker-compose up -d

# Kubernetes deploy
kubectl apply -f deployment/kubernetes.yaml
```

---

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Find and kill process on port 8888
netstat -ano | findstr :8888
taskkill /PID <PID> /F
```

### Docker Issues
```powershell
# Clean Docker system
docker system prune -a

# Restart Docker Desktop
Restart-Service docker
```

### Test Failures
```powershell
# Clear cache
Remove-Item -Recurse node_modules
npm install

# Reset database
cd backend; npm run reset
npm run setup
```

### MongoDB Connection
```powershell
# Test connection
mongosh "your-mongodb-uri"

# Check .env file
cat backend/.env
```

---

## 📁 File Locations

| File Type | Location |
|-----------|----------|
| **Backend Tests** | `backend/tests/api.test.js` |
| **UI Tests** | `tests/cypress/e2e/ui-tests.cy.js` |
| **Performance Tests** | `tests/performance/*.js` |
| **Test Plan** | `docs/TEST_PLAN.md` |
| **Deployment Guide** | `docs/DEPLOYMENT_GUIDE.md` |
| **Project Report** | `PROJECT_REPORT.md` |
| **Docker Config** | `docker-compose.yml` |
| **Jenkins Pipeline** | `Jenkinsfile` |
| **GitHub Actions** | `.github/workflows/cicd-pipeline.yml` |
| **Kubernetes** | `deployment/kubernetes.yaml` |

---

## 🔑 Default Credentials

**Admin User:**
- Email: `admin@admin.com`
- Password: `admin123`
- Role: Owner

---

## 📊 Test Coverage Summary

- **Backend Unit Tests:** 30+ test cases
- **Frontend UI Tests:** 45+ test cases
- **API Endpoint Tests:** 25+ test cases
- **Performance Tests:** 2 scenarios
- **Total:** 100+ automated tests

---

## 🌐 Environment Variables

### Backend (.env)
```env
DATABASE=mongodb+srv://user:pass@cluster.mongodb.net/idurar
JWT_SECRET=your_secret_key
NODE_ENV=production
PUBLIC_SERVER_FILE=http://localhost:8888/
```

### Frontend (.env)
```env
VITE_FILE_BASE_URL=http://localhost:8888/
VITE_BACKEND_SERVER=http://localhost:8888/
PROD=false
```

---

## 📦 CI/CD Pipeline Stages

1. **Source** → GitHub/GitLab webhook trigger
2. **Build** → Install deps, lint, build artifacts
3. **Test** → Unit, integration, E2E tests
4. **Scan** → Security vulnerability scanning
5. **Stage** → Deploy to staging environment
6. **Validate** → Staging tests and validation
7. **Approve** → Manual approval gate
8. **Deploy** → Production deployment
9. **Monitor** → Health checks and monitoring

---

## 🛠️ Tools Used

- **CI/CD:** Jenkins, GitHub Actions
- **Testing:** Jest, Cypress, k6, Trivy
- **Containers:** Docker, Docker Compose
- **Orchestration:** Kubernetes
- **Cloud:** AWS (CodeDeploy, CodeBuild)
- **Monitoring:** New Relic, Sentry

---

## 📞 Quick Help

**Application not starting?**
- Check Docker is running
- Check ports 80 and 8888 are free
- Verify .env files are configured

**Tests failing?**
- Ensure dependencies are installed
- Check Node.js version (v20.9.0+)
- Verify database connection

**Can't login?**
- Run `npm run setup` in backend
- Check MongoDB connection
- Use default credentials

---

## 📚 Documentation Links

- **Full Test Plan:** [docs/TEST_PLAN.md](docs/TEST_PLAN.md)
- **Deployment Guide:** [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)
- **Project Report:** [PROJECT_REPORT.md](PROJECT_REPORT.md)
- **Original Repo:** https://github.com/idurar/idurar-erp-crm

---

**Need more help?** Check the full documentation or create a GitHub issue.

**Last Updated:** December 5, 2025
