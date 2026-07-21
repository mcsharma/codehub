# hgweb service config

Config for the hgweb CLI door running on the DigitalOcean VM at
143.110.207.184 (`hg.greensnippet.com`). Mirrors what's actually deployed;
edit here and re-deploy, don't hand-edit on the box.

## Files → deploy paths

| File                 | Deploy path                          |
|-----------------------|---------------------------------------|
| `hgweb.ini`           | `/etc/hgweb.ini`                     |
| `hgweb_wsgi.py`       | `/opt/hgservice/hgweb_wsgi.py`       |
| `hgweb.service`       | `/etc/systemd/system/hgweb.service`  |
| `nginx-hgweb.conf`    | `/etc/nginx/sites-enabled/hgweb`     |

## Stack

TLS (Let's Encrypt via certbot, auto-renews) → nginx (basic auth) →
gunicorn (venv at `/opt/hgservice/venv`, `hgservice` system user) →
hgweb → `/data/repos/{tenant}/{repo}/`.

`hgweb.ini` uses `/data/repos/**` (recursive glob) to pick up the
nested tenant/repo layout — Mercurial doesn't support `*/*`.

`hgweb_wsgi.py` passes the config path as `bytes` (`b'/etc/hgweb.ini'`),
required on this Mercurial/Python version.

## Auth (stopgap, not real permissions)

nginx `auth_basic` gates the whole site behind one shared credential in
`/etc/nginx/.htpasswd` (not checked in — regenerate with
`htpasswd -bc /etc/nginx/.htpasswd hguser '<password>'` on the box).
This only blocks anonymous internet access — every credentialed user
can read/push every tenant's repo, since hgweb itself still has
`allow_push = *`. Real per-tenant permission checks (the
`/internal/auth-check` + nginx `auth_request` design) are a deliberate
follow-up, not yet built.

## Redeploying a change

```bash
scp hgweb.ini root@143.110.207.184:/etc/hgweb.ini
scp hgweb_wsgi.py root@143.110.207.184:/opt/hgservice/hgweb_wsgi.py
ssh root@143.110.207.184 'rm -rf /opt/hgservice/__pycache__; systemctl restart hgweb'

scp nginx-hgweb.conf root@143.110.207.184:/etc/nginx/sites-enabled/hgweb
ssh root@143.110.207.184 'nginx -t && systemctl reload nginx'
```
