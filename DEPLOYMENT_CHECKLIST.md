# Deployment Checklist

Use this checklist to ensure you don't miss any steps during deployment.

## Pre-Deployment

- [ ] Build tested locally (`npm run build`)
- [ ] `.env.production` file created with correct backend API URL
- [ ] All environment variables configured
- [ ] VPS server access (SSH) confirmed
- [ ] Domain name configured (if using domain)

## VPS Setup

- [ ] Connected to VPS via SSH
- [ ] System packages updated (`sudo apt update && sudo apt upgrade`)
- [ ] Nginx installed (`sudo apt install nginx`)
- [ ] Node.js installed (if needed)
- [ ] Git installed (if using Git deployment)

## File Transfer

- [ ] Production build created (`npm run build`)
- [ ] Files transferred to VPS (`/var/www/edureach-frontend`)
- [ ] File permissions set correctly (`www-data:www-data`, `755`)

## Nginx Configuration

- [ ] Nginx config file created (`/etc/nginx/sites-available/edureach-frontend`)
- [ ] Config file enabled (`ln -s` to `sites-enabled`)
- [ ] Nginx config tested (`sudo nginx -t`)
- [ ] Nginx reloaded/restarted (`sudo systemctl reload nginx`)
- [ ] Default site removed (if needed)

## Security

- [ ] Firewall configured (`sudo ufw allow 'Nginx Full'`)
- [ ] SSH access secured
- [ ] SSL certificate installed (if using HTTPS)
- [ ] SSL auto-renewal configured

## Testing

- [ ] Frontend accessible via HTTP
- [ ] Frontend accessible via HTTPS (if SSL configured)
- [ ] All routes working (SPA routing)
- [ ] Static assets loading correctly
- [ ] API calls working (check browser console)
- [ ] No CORS errors
- [ ] No 404 errors

## Post-Deployment

- [ ] Nginx logs checked for errors
- [ ] Monitoring set up (optional)
- [ ] Backup strategy in place
- [ ] Update process documented

## Quick Commands Reference

```bash
# Build
npm run build

# Deploy (using script)
chmod +x deploy.sh
./deploy.sh your-vps-ip root /var/www/edureach-frontend

# Or manual deploy
rsync -avz --delete dist/ user@vps-ip:/var/www/edureach-frontend/
ssh user@vps-ip "sudo chown -R www-data:www-data /var/www/edureach-frontend"
ssh user@vps-ip "sudo systemctl reload nginx"

# Check status
ssh user@vps-ip "sudo systemctl status nginx"
ssh user@vps-ip "sudo tail -f /var/log/nginx/error.log"
```

## Troubleshooting

If something goes wrong:

1. Check Nginx status: `sudo systemctl status nginx`
2. Check Nginx config: `sudo nginx -t`
3. Check error logs: `sudo tail -f /var/log/nginx/error.log`
4. Check file permissions: `ls -la /var/www/edureach-frontend`
5. Verify files exist: `ls -la /var/www/edureach-frontend/index.html`

