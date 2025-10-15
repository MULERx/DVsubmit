# Deployment Guide

This guide explains how to deploy your Next.js application to an Ubuntu server using GitHub Actions and PM2.

## Prerequisites

### On your Ubuntu server:

1. **Install Node.js and npm:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install PM2 globally:**
   ```bash
   sudo npm install -g pm2
   ```

3. **Setup PM2 to start on boot:**
   ```bash
   pm2 startup
   sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
   ```

4. **Create deployment directory:**
   ```bash
   mkdir -p /var/www/your-app
   sudo chown $USER:$USER /var/www/your-app
   ```

## GitHub Secrets Configuration

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `HOST` | Your server IP address | `192.168.1.100` |
| `USERNAME` | SSH username | `ubuntu` |
| `PRIVATE_KEY` | SSH private key content | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `PORT` | SSH port (optional, default: 22) | `22` |
| `APP_NAME` | PM2 application name | `dvsubmit` |
| `DEPLOY_PATH` | Deployment directory path | `/var/www/dvsubmit` |

## SSH Key Setup

1. **Generate SSH key pair on your local machine:**
   ```bash
   ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
   ```

2. **Copy public key to your server:**
   ```bash
   ssh-copy-id username@your-server-ip
   ```

3. **Copy private key content to GitHub secrets:**
   ```bash
   cat ~/.ssh/id_rsa
   ```
   Copy the entire output (including headers) to the `PRIVATE_KEY` secret.

## Environment Variables

Create a `.env` file on your server at the deployment path with your production environment variables:

```bash
# Database
DATABASE_URL="your-production-database-url"

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Other environment variables
NODE_ENV=production
```

## Nginx Configuration (Optional)

If you want to use Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

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
    }
}
```

## Deployment Process

1. Push your code to the `main` or `master` branch
2. GitHub Actions will automatically:
   - Build your Next.js application
   - Deploy it to your Ubuntu server
   - Start/restart the application with PM2

## Useful PM2 Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs dvsubmit

# Restart application
pm2 restart dvsubmit

# Stop application
pm2 stop dvsubmit

# Monitor resources
pm2 monit

# Save current PM2 processes
pm2 save

# Resurrect saved processes
pm2 resurrect
```

## Troubleshooting

1. **Check GitHub Actions logs** for build/deployment errors
2. **Check PM2 logs** on the server: `pm2 logs dvsubmit`
3. **Verify environment variables** are properly set
4. **Check file permissions** in the deployment directory
5. **Ensure database is accessible** from the server

## Security Notes

- Keep your SSH private key secure
- Use environment variables for sensitive data
- Consider using a firewall to restrict access
- Regularly update your server and dependencies