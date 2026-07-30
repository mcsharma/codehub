# hgweb-app image — the same one built for both the prod and test VM
# stacks (see ../vm/docker-compose.{prod,test}.yml and README.md). hgweb.ini
# and hgweb_wsgi.py are bind-mounted in at runtime rather than baked into
# the image, so both stacks always run the exact files checked in here.
FROM python:3.11-slim

# mercurial's C extensions (mpatch, bdiff, etc.) need a compiler + libc
# headers to build from the pip sdist — python:3.11-slim ships neither
# (plain `gcc` alone still fails: stdlib.h comes from libc6-dev, which is
# only pulled in by build-essential).
RUN apt-get update && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir mercurial gunicorn

WORKDIR /opt/hgservice

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "hgweb_wsgi:application"]
