# Vercel Domain DNS Setup Guide

## Overview
To connect your custom domain to Vercel, you need to add DNS records at your domain provider (where you bought your domain - e.g., Namecheap, GoDaddy, Google Domains, Cloudflare, etc.).

## Step-by-Step Instructions

### Step 1: Get Your DNS Records from Vercel
1. Go to your Vercel project dashboard
2. Click on **Settings** → **Domains**
3. Click **Add** and enter your domain
4. Vercel will show you the exact DNS records you need to add
5. It will show either:
   - **A records** (for apex/root domains like `example.com`)
   - **CNAME records** (for subdomains like `www.example.com`)
   - **Both** (if you want both root and www)

### Step 2: Add DNS Records at Your Domain Provider

#### For Apex/Root Domain (example.com):
**DNS Record Type: A**
- **Name/Host**: `@` or leave blank (depends on your provider)
- **Value/Target**: The IP address Vercel provides (usually something like `76.76.21.21`)
- **TTL**: `3600` or leave as default

**Note**: Vercel may provide multiple A records - add ALL of them.

#### For WWW Subdomain (www.example.com):
**DNS Record Type: CNAME**
- **Name/Host**: `www`
- **Value/Target**: `cname.vercel-dns.com` (or what Vercel shows)
- **TTL**: `3600` or leave as default

### Step 3: Common Domain Providers

#### Namecheap
1. Log in → Domain List → Manage → Advanced DNS
2. Click "Add New Record"
3. Select the record type (A or CNAME)
4. Enter the values from Vercel
5. Save

#### GoDaddy
1. Log in → My Products → DNS (next to your domain)
2. Click "Add" in the Records section
3. Select Type → Enter values
4. Save

#### Google Domains / Squarespace Domains
1. Log in → Domain → DNS
2. Scroll to "Custom records"
3. Click "Manage custom records"
4. Add the records from Vercel

#### Cloudflare
1. Log in → Select your domain → DNS → Records
2. Click "Add record"
3. Select Type → Enter values
4. Make sure proxy is OFF (orange cloud) for initial setup
5. Save

#### Route 53 (AWS)
1. AWS Console → Route 53 → Hosted zones
2. Select your domain
3. Create Record
4. Enter values → Create

### Step 4: Verify DNS Propagation
After adding DNS records:
1. Wait 5-60 minutes for DNS to propagate
2. Check propagation at: https://dnschecker.org
3. In Vercel, the domain status should change to "Valid Configuration"

### Step 5: SSL Certificate
Once DNS is verified, Vercel automatically:
- Issues a free SSL certificate
- Sets up HTTPS
- This may take a few minutes

## Common Issues & Solutions

### Issue: "DNS records don't match"
**Solution**: 
- Double-check you entered the EXACT values from Vercel
- Make sure there are no typos
- Remove any old DNS records that conflict
- Wait for DNS propagation (can take up to 48 hours, usually much less)

### Issue: DNS hasn't propagated yet
**Solution**:
- Wait 10-60 minutes
- Clear your DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)
- Check at multiple DNS checker sites

### Issue: Using Cloudflare Proxy
**Solution**:
- If using Cloudflare, turn OFF the proxy (gray cloud) initially
- After verification, you can turn proxy back on
- Vercel will show different records if you're using Cloudflare proxy

### Issue: Subdomain not working
**Solution**:
- Make sure you're using CNAME, not A record
- Check the name field is exactly `www` (or your subdomain)
- Verify the target points to Vercel's CNAME

## Quick Checklist
- [ ] Copied exact DNS records from Vercel dashboard
- [ ] Added records at your domain provider
- [ ] Waited for DNS propagation (5-60 minutes)
- [ ] Verified records match in Vercel dashboard
- [ ] Domain shows "Valid Configuration" in Vercel
- [ ] SSL certificate issued automatically

## Need Help?
- Vercel DNS Docs: https://vercel.com/docs/concepts/projects/domains
- Check DNS propagation: https://dnschecker.org
- Test your domain: Visit your domain in browser (may need to wait)

---

**Important**: DNS changes can take up to 48 hours to fully propagate worldwide, but usually work within 10-60 minutes.
