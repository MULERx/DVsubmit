# Ubuntu Server Setup Guide for dvsubmit.com

This guide will help you set up your Ubuntu server to deploy the 'dvsubmit' application and link it to the domain dvsubmit.com.

## Step 1: Initial Server Setup

### 1.1 Update System Packages
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Essential Packages
```bash
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
```

### 1.3 Create Non-Root User (if not already done)
```bash
# Create user
sudo adduser dvsubmit

# Add to sudo group
sudo usermod -aG sudo dvsubmit

# Switch to new user
su - dvsubmit
```

## Step 2: Install Node.js and npm

### 2.1 Install Node.js 18.x
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2.2 Verify Installation
```bash
node --version
npm --version
```

## Step 3: Install PM2

### 3.1 Install PM2 Globally
```bash
sudo npm install -g pm2
```

### 3.2 Setup PM2 Startup Script
```bash
pm2 startup
# Copy and run the command that PM2 outputs
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u dvsubmit --hp /home/dvsubmit
```

## Step 4: Setup Application Directory

### 4.1 Create Application Directory
```bash
sudo mkdir -p /var/www/dvsubmit
sudo chown dvsubmit:dvsubmit /var/www/dvsubmit
cd /var/www/dvsubmit
```

### 4.2 Create Environment File
```bash
nano /var/www/dvsubmit/.env
```

Add your production environment variables:
```env
# Database
DATABASE_URL="your-production-database-url"
DIRECT_URL="your-direct-database-url"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ntzsbuboifpexxmkaifi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://dvsubmit.com
PORT=3009
NODE_ENV=production

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Step 5: Install and Configure Nginx

### 5.1 Install Nginx
```bash
sudo apt install -y nginx
```

### 5.2 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/dvsubmit.com
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name dvsubmit.com www.dvsubmit.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    location / {
        proxy_pass http://localhost:3009;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Handle static files
    location /_next/static {
        proxy_pass http://localhost:3009;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Handle favicon and other static assets
    location ~* \.(ico|css|js|gif|jpe?g|png|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3009;
        add_header Cache-Control "public, max-age=31536000";
    }
}
```

### 5.3 Enable the Site
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/dvsubmit.com /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## Step 6: Install and Configure SSL with Let's Encrypt

### 6.1 Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 6.2 Obtain SSL Certificate
```bash
sudo certbot --nginx -d dvsubmit.com -d www.dvsubmit.com
```

### 6.3 Setup Auto-Renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Setup cron job for auto-renewal
sudo crontab -e
```

Add this line to crontab:
```bash
0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 7: Configure Firewall

### 7.1 Setup UFW Firewall
```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Check status
sudo ufw status
```

## Step 8: Setup GitHub SSH Key

### 8.1 Generate SSH Key
```bash
ssh-keygen -t rsa -b 4096 -C "dvsubmit@youremail.com"
```

### 8.2 Add SSH Key to SSH Agent
```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa
```

### 8.3 Copy Public Key
```bash
cat ~/.ssh/id_rsa.pub
```
Copy this key and add it to your GitHub repository's Deploy Keys or your GitHub account's SSH keys.

## Step 9: Update GitHub Secrets

Update your GitHub repository secrets with these values:

| Secret Name | Value |
|-------------|-------|
| `HOST` | Your server IP address |
| `USERNAME` | `dvsubmit` |
| `PRIVATE_KEY` | Content of `~/.ssh/id_rsa` |
| `PORT` | `22` |
| `APP_NAME` | `dvsubmit` |
| `DEPLOY_PATH` | `/var/www/dvsubmit` |

## Step 10: Domain Configuration

### 10.1 DNS Settings
Configure your domain DNS settings to point to your server:

**A Records:**
- `dvsubmit.com` → Your server IP
- `www.dvsubmit.com` → Your server IP

**Optional CNAME:**
- `www` → `dvsubmit.com`

### 10.2 Verify DNS Propagation
```bash
# Check DNS resolution
nslookup dvsubmit.com
dig dvsubmit.com
```

## Step 11: Test Deployment

### 11.1 Manual Test (Optional)
```bash
# Clone your repository
cd /var/www/dvsubmit
git clone https://github.com/yourusername/your-repo.git current
cd current

# Install dependencies
npm ci --production

# Generate Prisma client
npm run db:generate

# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
```

### 11.2 Check Application Status
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs dvsubmit

# Check Nginx status
sudo systemctl status nginx

# Check if site is accessible
curl -I http://localhost:3009
curl -I https://dvsubmit.com
```

## Step 12: Monitoring and Maintenance

### 12.1 Setup Log Rotation
```bash
sudo nano /etc/logrotate.d/dvsubmit
```

Add:
```
/var/www/dvsubmit/current/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 dvsubmit dvsubmit
    postrotate
        pm2 reload dvsubmit
    endscript
}
```

### 12.2 Useful Commands
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
htop

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Restart services
sudo systemctl restart nginx
pm2 restart dvsubmit

# Update system
sudo apt update && sudo apt upgrade -y
```

## Troubleshooting

### Common Issues:

1. **Port 3009 not accessible:**
   ```bash
   sudo netstat -tlnp | grep :3009
   pm2 logs dvsubmit
   ```

2. **Nginx configuration errors:**
   ```bash
   sudo nginx -t
   sudo tail -f /var/log/nginx/error.log
   ```

3. **SSL certificate issues:**
   ```bash
   sudo certbot certificates
   sudo certbot renew --dry-run
   ```

4. **PM2 process not starting:**
   ```bash
   pm2 logs dvsubmit
   pm2 restart dvsubmit
   ```

5. **Database connection issues:**
   - Check environment variables
   - Verify database URL and credentials
   - Test database connectivity

## Security Checklist

- [ ] UFW firewall enabled
- [ ] SSH key authentication configured
- [ ] SSL certificate installed
- [ ] Regular security updates scheduled
- [ ] Strong passwords used
- [ ] Unnecessary services disabled
- [ ] Log monitoring setup

Your application should now be accessible at https://dvsubmit.com!