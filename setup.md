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
docker network create dpin-network
```

## Application Deployment

### 2. Nginx Configuration

Create a new Nginx configuration file:

```bash
# Create nginx.conf
events {}

http {
    # Trust Cloudflare IP ranges
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 104.16.0.0/12;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 131.0.72.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    real_ip_header CF-Connecting-IP;

    server {
        listen 80;

        # WebSocket Configuration
        location /ws/ {
            proxy_pass http://dpin-hub:8081;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
            proxy_set_header Host $host;

            # Forward real client IPs
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header CF-Connecting-IP $http_cf_connecting_ip;
        }

        # Health Check Endpoint
        location / {
            return 200 'Nginx is running behind Cloudflare';
            add_header Content-Type text/plain;
        }
    }
}
```

### 3. Run Services

Start Nginx with the custom configuration:

```bash
# Run Nginx with custom config
docker run -d --name nginx -p 80:80 -v /home/ubuntu/nginx.conf:/etc/nginx/nginx.conf:ro --network dpin-network nginx
```

Start a local database:

```bash
# Run DB command
docker run --name postgres --network dpin-network -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=post123 -p 5432:5432 -v /data:/var/lib/postgresql/data -d postgres:alpine

```

Start the Hub service:

```bash
# Run Hub service
docker run -d \
    --name hub \
    -p 8081:8081 \
    --network dpin-network \
    -e DATABASE_URL="postgresql://postgres:post123@postgres/postgres" \
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
docker network inspect dpin-network
```

## Other Userful Commands

```bash
#To check if internal network connected or not
docker exec -it <nginx_container> sh
apk add curl
curl http://dpin-hub:8081/


#To check on which network a container (dpin-hub) is running on
docker inspect --format='{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' dpin-hub

#Last 50 lines of log (-f for streamming)
docker logs --tail 50 -f dpin-hub
```

## Security Note

⚠️ **Important**: The configuration contains sensitive information (database credentials and Pusher keys). In a production environment:

- Use environment files or secrets management
- Secure the Nginx configuration
- Use HTTPS
- Implement proper access controls
