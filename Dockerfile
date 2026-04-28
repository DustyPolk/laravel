# syntax=docker/dockerfile:1

# ----- Build stage: composer deps + Vite assets (needs PHP for Wayfinder) -----
FROM serversideup/php:8.4-cli-alpine AS builder

USER root
WORKDIR /var/www/html

RUN apk add --no-cache nodejs npm

COPY composer.json composer.lock ./
RUN composer install \
        --no-dev \
        --prefer-dist \
        --no-interaction \
        --no-autoloader \
        --no-scripts

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN composer dump-autoload --optimize --classmap-authoritative --no-dev \
    && npm run build \
    && rm -rf node_modules

# ----- Runtime stage: nginx + php-fpm -----
FROM serversideup/php:8.4-fpm-nginx-alpine

WORKDIR /var/www/html

COPY --from=builder --chown=www-data:www-data /var/www/html /var/www/html

ENV AUTORUN_ENABLED=true \
    AUTORUN_LARAVEL_MIGRATION=true \
    AUTORUN_LARAVEL_MIGRATION_ISOLATION=true \
    AUTORUN_LARAVEL_OPTIMIZE=true \
    SSL_MODE=off \
    PHP_OPCACHE_ENABLE=1
