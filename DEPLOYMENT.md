# Deployment Guide

This guide covers different deployment options for the QuizMaster application.

## 🚀 Quick Start

### Local Development
```bash
# Install dependencies
npm install
cd backend && npm install

# Start MongoDB
./start-mongodb.sh

# Start backend
cd backend && npm start

# Start frontend (in new terminal)
npm start
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Access the application
# Frontend: http://localhost
# Backend: http://localhost:4000
```

## 🌐 Production Deployment

### Option 1: Docker Compose (Recommended for VPS)

1. **Prepare your server**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Clone and configure**
   ```bash
   git clone https://github.com/varsha698/Quiz-Generator.git
   cd Quiz-Generator
   
   # Set environment variables
   export GROQ_API_KEY=your_groq_api_key_here
   export JWT_SECRET=your_jwt_secret_here
   export MONGODB_PASSWORD=your_secure_password
   ```

3. **Deploy**
   ```bash
   docker-compose up -d
   ```

### Option 2: Kubernetes

1. **Prerequisites**
   - Kubernetes cluster (GKE, EKS, AKS, or local)
   - kubectl configured
   - Helm (optional)

2. **Deploy to Kubernetes**
   ```bash
   # Apply all Kubernetes manifests
   kubectl apply -f k8s/
   
   # Check deployment status
   kubectl get pods -n quizmaster
   kubectl get services -n quizmaster
   ```

3. **Configure Ingress**
   - Update `k8s/ingress.yaml` with your domain
   - Install cert-manager for SSL certificates
   - Configure DNS to point to your cluster

### Option 3: Cloud Platforms

#### Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
vercel --prod

# Set environment variables in Vercel dashboard
# GROQ_API_KEY=your_api_key
```

#### Railway (Full Stack)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Heroku
```bash
# Install Heroku CLI
# Create Procfile
echo "web: npm start" > Procfile

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

## 🔧 Environment Configuration

### Required Environment Variables

#### Frontend
```bash
GROQ_API_KEY=your_groq_api_key_here
NODE_ENV=production
```

#### Backend
```bash
MONGODB_URI=mongodb://localhost:27017/quizmaster
JWT_SECRET=your_jwt_secret_here
GROQ_API_KEY=your_groq_api_key_here
NODE_ENV=production
PORT=4000
```

### Optional Environment Variables
```bash
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
CORS_ORIGIN=https://yourdomain.com
```

## 📊 Monitoring and Logging

### Health Checks
- Frontend: `GET /health`
- Backend: `GET /api/health`

### Logging
```bash
# View Docker logs
docker-compose logs -f

# View Kubernetes logs
kubectl logs -f deployment/quizmaster-frontend -n quizmaster
kubectl logs -f deployment/quizmaster-backend -n quizmaster
```

### Monitoring Setup
1. **Prometheus + Grafana**
   ```bash
   # Add monitoring to docker-compose.yml
   # Configure Prometheus scraping
   # Set up Grafana dashboards
   ```

2. **Application Insights**
   - Add telemetry to Angular app
   - Configure backend logging
   - Set up alerts

## 🔒 Security Considerations

### SSL/TLS
```bash
# Generate SSL certificates
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Update nginx configuration
# Configure HTTPS redirects
```

### Database Security
- Use strong passwords
- Enable MongoDB authentication
- Configure network access
- Regular backups

### API Security
- Rate limiting
- Input validation
- CORS configuration
- JWT token expiration

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Find and kill process
   lsof -ti:4000 | xargs kill -9
   ```

2. **MongoDB connection failed**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod
   
   # Restart MongoDB
   sudo systemctl restart mongod
   ```

3. **Docker build failed**
   ```bash
   # Clean Docker cache
   docker system prune -a
   
   # Rebuild without cache
   docker-compose build --no-cache
   ```

4. **Kubernetes pods not starting**
   ```bash
   # Check pod status
   kubectl describe pod <pod-name> -n quizmaster
   
   # Check logs
   kubectl logs <pod-name> -n quizmaster
   ```

### Performance Optimization

1. **Frontend**
   - Enable gzip compression
   - Configure CDN
   - Optimize images
   - Use service workers

2. **Backend**
   - Database indexing
   - Connection pooling
   - Caching (Redis)
   - Load balancing

3. **Database**
   - Regular maintenance
   - Index optimization
   - Query optimization
   - Backup strategy

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale Kubernetes deployments
kubectl scale deployment quizmaster-frontend --replicas=5 -n quizmaster
kubectl scale deployment quizmaster-backend --replicas=3 -n quizmaster
```

### Vertical Scaling
- Increase container resources
- Optimize application code
- Database sharding
- Caching strategies

## 🔄 CI/CD Integration

### GitHub Actions
- Automatic testing on PR
- Deployment on merge to main
- Security scanning
- Performance monitoring

### Manual Deployment
```bash
# Build and push to registry
docker build -t your-registry/quizmaster:latest .
docker push your-registry/quizmaster:latest

# Deploy to production
kubectl set image deployment/quizmaster-frontend frontend=your-registry/quizmaster:latest -n quizmaster
```

## 📞 Support

For deployment issues:
1. Check the logs
2. Review this guide
3. Create an issue on GitHub
4. Contact the maintainers

---

**Happy Deploying! 🚀**
