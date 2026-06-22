# Deploying PartStation.in to a Hostinger VPS

This guide deploys the full stack (React build served by Nginx + FastAPI via Gunicorn/Uvicorn + MongoDB) on a single Hostinger VPS running Ubuntu 22.04, with a free Let's Encrypt SSL for `partstation.in`.

> Replace `partstation.in` and paths with your own where needed.

---

## 0. Prerequisites
- A Hostinger VPS (KVM 1 or higher recommended: 2 GB+ RAM) with Ubuntu 22.04.
- Your domain `partstation.in` pointed to the VPS IP (A record `@` and `www` → VPS IP) via Hostinger DNS.
- SSH access to the VPS.

---

## 1. Server setup

```bash
ssh root@YOUR_VPS_IP
apt update && apt upgrade -y
apt install -y git nginx python3 python3-venv python3-pip curl ufw

# Node + Yarn (for building the frontend)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
npm install -g yarn

# Firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

### MongoDB
```bash
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update && apt install -y mongodb-org
systemctl enable --now mongod
```
> MongoDB listens on 127.0.0.1 only by default — keep it that way (don't expose 27017 publicly).

---

## 2. Get the code

```bash
mkdir -p /var/www && cd /var/www
git clone https://github.com/abhiishk/partstation-emer.git partstation
cd partstation
```

---

## 3. Backend (FastAPI)

```bash
cd /var/www/partstation/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn uvicorn[standard]

cp .env.example .env
nano .env
```

Set production values in `backend/.env`:
```
MONGO_URL="mongodb://127.0.0.1:27017"
DB_NAME="partstation"
CORS_ORIGINS="https://partstation.in,https://www.partstation.in"
JWT_SECRET="<run: python -c 'import secrets;print(secrets.token_hex(32))'>"
ADMIN_EMAIL="you@partstation.in"
ADMIN_PASSWORD="<strong-password>"
EMAIL_ENABLED="false"          # set true + RESEND_API_KEY when ready
EMERGENT_LLM_KEY=""            # only needed for in-app image uploads
APP_NAME="partstation"
```

### Run as a service (systemd)
Create `/etc/systemd/system/partstation-api.service`:
```ini
[Unit]
Description=PartStation FastAPI
After=network.target mongod.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/partstation/backend
EnvironmentFile=/var/www/partstation/backend/.env
ExecStart=/var/www/partstation/backend/venv/bin/gunicorn server:app \
  -k uvicorn.workers.UvicornWorker -w 2 -b 127.0.0.1:8001 --timeout 120
Restart=always

[Install]
WantedBy=multi-user.target
```
```bash
chown -R www-data:www-data /var/www/partstation
systemctl daemon-reload
systemctl enable --now partstation-api
systemctl status partstation-api      # should be active (running)
curl http://127.0.0.1:8001/api/settings   # sanity check
```

---

## 4. Frontend (React build)

```bash
cd /var/www/partstation/frontend
cp .env.example .env
nano .env
```
Set:
```
REACT_APP_BACKEND_URL=https://partstation.in
```
> Important: the frontend must call the SAME domain. Nginx will route `/api` to the backend (next step), so `REACT_APP_BACKEND_URL` is just your site root.

Build:
```bash
yarn install
yarn build       # outputs to /var/www/partstation/frontend/build
```

---

## 5. Nginx (serve build + proxy /api)

Create `/etc/nginx/sites-available/partstation`:
```nginx
server {
    listen 80;
    server_name partstation.in www.partstation.in;

    root /var/www/partstation/frontend/build;
    index index.html;

    client_max_body_size 12M;   # allow image uploads

    # API + uploaded files -> FastAPI
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # React SPA fallback
    location / {
        try_files $uri /index.html;
    }
}
```
```bash
ln -s /etc/nginx/sites-available/partstation /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

---

## 6. SSL (Let's Encrypt)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d partstation.in -d www.partstation.in
# choose redirect HTTP -> HTTPS when prompted
```
Auto-renewal is installed by certbot; test with `certbot renew --dry-run`.

Your site is now live at **https://partstation.in** and the admin at **https://partstation.in/ops-control/admin/login**.

---

## 7. Updating after new code

```bash
cd /var/www/partstation
git pull
# backend
cd backend && source venv/bin/activate && pip install -r requirements.txt && systemctl restart partstation-api
# frontend
cd ../frontend && yarn install && yarn build
systemctl reload nginx
```

---

## 8. Backups (MongoDB)

```bash
# manual dump
mongodump --db partstation --out /root/backups/$(date +%F)

# automate daily via cron (crontab -e)
0 2 * * * mongodump --db partstation --out /root/backups/$(date +\%F) >/dev/null 2>&1
```

---

## 9. Operations cheat-sheet

| Task | Command |
|------|---------|
| Backend logs | `journalctl -u partstation-api -f` |
| Restart backend | `systemctl restart partstation-api` |
| Reload Nginx | `systemctl reload nginx` |
| Mongo shell | `mongosh partstation` |
| Renew SSL test | `certbot renew --dry-run` |

---

## 10. Production checklist
- [ ] Strong `JWT_SECRET` and admin password set
- [ ] `CORS_ORIGINS` restricted to your domain(s)
- [ ] MongoDB bound to 127.0.0.1 (not public)
- [ ] HTTPS working + HTTP→HTTPS redirect
- [ ] Daily Mongo backup cron in place
- [ ] (Optional) Resend / PhonePe / Google login keys configured
- [ ] (Optional) For independent image uploads, replace `backend/storage.py` with S3/local-disk storage instead of Emergent object storage

---

### Note on image uploads
The in-app image **upload** uses Emergent-managed object storage (needs `EMERGENT_LLM_KEY`). For a fully self-hosted setup, either:
- keep using pasted image URLs (no key needed), or
- swap `storage.py` to save files to local disk (e.g. `/var/www/partstation/uploads`) or an S3-compatible bucket, and serve them via Nginx / the existing `/api/files/{path}` route.
