# GCP Deployment Guide

Two working paths. Pick one.

## Option A: Cloud Run (recommended)

Cloud Run bills only for actual request time, scales to zero when idle,
and does not require you to manage a VM. The plan: build the Vite bundle
into a tiny nginx container, push to Artifact Registry, deploy.

### 1. Build locally

```bash
cd full-stack/app
cp .env.example .env.local        # fill in your real Supabase values
npm install
npm run build                     # produces app/dist/
```

Environment variables prefixed with `VITE_` are baked into the bundle at
build time. You do not need to pass them to Cloud Run at runtime.

### 2. Create the Dockerfile

The Dockerfile lives at `full-stack/app/Dockerfile`:

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
RUN npm run build

FROM nginx:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

`nginx.conf` (same folder) serves the SPA and rewrites unknown paths to
`index.html` so client-side routes like `/admin` work on refresh:

```nginx
server {
  listen 8080;
  server_name _;
  server_tokens off;
  root /usr/share/nginx/html;
  index index.html;

  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "DENY" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location ~* \.(js|css|svg|png|jpg|jpeg|webp|woff2)$ {
    expires 7d;
    add_header Cache-Control "public, immutable";
  }
}
```

Cloud Run listens on port 8080 by convention, which is why the config
above binds there.

### 3. Push to Artifact Registry

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

gcloud artifacts repositories create rich-inter \
  --repository-format=docker \
  --location=us-central1

gcloud auth configure-docker us-central1-docker.pkg.dev

docker build \
  --build-arg VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
  --build-arg VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
  -t us-central1-docker.pkg.dev/YOUR_PROJECT_ID/rich-inter/spa:v1 \
  .

docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/rich-inter/spa:v1
```

### 4. Deploy

```bash
gcloud run deploy rich-inter-spa \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/rich-inter/spa:v1 \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --min-instances 0 \
  --max-instances 3
```

Cloud Run prints the service URL. That URL goes in the submission.

### 5. Add the Cloud Run URL to Supabase

Authentication > URL Configuration: add the Cloud Run URL as both a
**Site URL** and an allowed **Redirect URL**. Without this, OAuth
callbacks bounce back to localhost.

---

## Option B: Compute Engine VM

Useful if you want to learn the nginx + VM side of things. Slower to
provision, and you pay for the VM even when idle.

### 1. Create the VM

```bash
gcloud compute instances create rich-inter-vm \
  --zone=us-central1-a \
  --machine-type=e2-small \
  --image-family=debian-12 \
  --image-project=debian-cloud \
  --tags=http-server,https-server
```

Open HTTP in the firewall (should be created automatically by the tags,
but verify):

```bash
gcloud compute firewall-rules list
```

### 2. SSH in and install nginx

```bash
gcloud compute ssh rich-inter-vm --zone=us-central1-a
sudo apt-get update
sudo apt-get install -y nginx
```

### 3. Upload the build

From your laptop, build locally and copy the `dist/` folder:

```bash
cd full-stack/app
npm run build
gcloud compute scp --recurse dist rich-inter-vm:~/dist --zone=us-central1-a
```

Back on the VM, move it into the nginx web root:

```bash
sudo rm -rf /var/www/html
sudo mv ~/dist /var/www/html
```

Replace `/etc/nginx/sites-available/default` with:

```nginx
server {
  listen 80 default_server;
  server_name _;
  server_tokens off;
  root /var/www/html;
  index index.html;

  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "DENY" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 4. Grab the external IP

```bash
gcloud compute instances describe rich-inter-vm --zone=us-central1-a \
  --format='value(networkInterfaces[0].accessConfigs[0].natIP)'
```

Visit `http://EXTERNAL_IP` in a browser. Add that IP (or a domain
pointed at it) to Supabase Authentication > URL Configuration.

---

## Troubleshooting

- **Blank page on a route refresh**: your nginx `try_files` line is
  wrong. SPA routing requires the fallback to `index.html`.
- **OAuth callback goes to localhost**: you forgot to add your
  production URL to Supabase's URL Configuration.
- **401 on admin actions in production but not locally**: confirm the
  user's role is `admin` in `user_roles`. Local Supabase projects and
  production Supabase projects do not share data.
- **Lighthouse score low on mobile**: run `npm run build` first and
  audit the production bundle, not the dev server. The dev server does
  not minify and skips HTTP caching.
