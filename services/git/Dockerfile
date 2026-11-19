# git-app image — the same one built for both the prod and test git VM
# stacks (see vm/docker-compose.{prod,test}.yml). etc/gitconfig and hooks/
# are bind-mounted in at runtime rather than baked into the image, mirroring
# services/hg/Dockerfile's reasoning: both stacks always run the exact files
# checked in here.
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    git fcgiwrap ca-certificates \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 9000

# fcgiwrap speaks FastCGI directly over this TCP socket — nginx's git-proxy
# (see vm/nginx-{prod,test}.conf) fastcgi_pass's straight to it, running the
# real `git http-backend` CGI binary per-request (GIT_PROJECT_ROOT/
# GIT_HTTP_EXPORT_ALL/PATH_INFO set as fastcgi params, not baked in here).
CMD ["fcgiwrap", "-f", "-s", "tcp:0.0.0.0:9000"]
