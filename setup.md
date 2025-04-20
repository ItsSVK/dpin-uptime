# DPIN-Uptime Deployment Guide

This guide explains how to deploy the DPIN-Uptime application on an AWS EC2 instance.

## Initial Server Setup

```bash
# Switch to root user
sudo su

# Update system packages
yum update -y

# Install Docker
yum install docker -y

# Start Docker service
service docker start

# Verify Docker status
service docker status
```

## Network Setup

```bash
# Create a Docker network for application communication
docker network create nginx-app-net
```

## Application Deployment

### 1. Pull Required Images

```bash
# Pull the hub service image
docker pull itssvk/hub

# Pull and run Nginx temporarily
docker run -d -p 80:80 nginx
```

### 2. Nginx Configuration

Create a new Nginx configuration file:

```bash
# Create nginx.conf
cat > nginx.conf << 'EOL'
events {}
http {
    server {
        listen 80;

        # WebSocket Configuration
        location /ws/ {
            proxy_pass http://hub:8081/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
            proxy_set_header Host $host;
        }

        # Health Check Endpoint
        location / {
            return 200 'Nginx is running';
            add_header Content-Type text/plain;
        }
    }
}
EOL
```

### 3. Run Services

Start Nginx with the custom configuration:

```bash
# Run Nginx with custom config
docker run -d \
    --name nginx \
    -p 80:80 \
    -v /home/ec2-user/nginx.conf:/etc/nginx/nginx.conf:ro \
    --network nginx-app-net \
    nginx
```

Start the Hub service:

```bash
# Run Hub service
docker run -d \
    --name hub \
    -p 8081:8081 \
    --network nginx-app-net \
    -e DATABASE_URL="postgresql://postgresneon_owner:npg_lXaxjv59bdWe@ep-proud-feather-a1hdwirk-pooler.ap-southeast-1.aws.neon.tech/postgresneon?sslmode=require" \
    -e NEXT_PUBLIC_PUSHER_APP_ID=1974339 \
    -e NEXT_PUBLIC_PUSHER_APP_KEY=fdf96afe3b823caa8b3e \
    -e NEXT_PUBLIC_PUSHER_APP_SECRET=537a511ca9cdb50b6f10 \
    -e NEXT_PUBLIC_PUSHER_APP_CLUSTER=ap2 \
    itssvk/hub
```

## Verification

To verify the deployment:

1. Check if containers are running:

```bash
docker ps
```

2. Test the Nginx health endpoint:

```bash
curl http://localhost
```

3. Check container logs:

```bash
# Check Nginx logs
docker logs nginx

# Check Hub service logs
docker logs hub
```

## Troubleshooting

If you encounter issues:

1. Check container status:

```bash
docker ps -a
```

2. View detailed logs:

```bash
docker logs -f hub
docker logs -f nginx
```

3. Verify network connectivity:

```bash
docker network inspect nginx-app-net
```

## Security Note

⚠️ **Important**: The configuration contains sensitive information (database credentials and Pusher keys). In a production environment:

- Use environment files or secrets management
- Secure the Nginx configuration
- Use HTTPS
- Implement proper access controls
