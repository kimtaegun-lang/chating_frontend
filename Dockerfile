# ===== Build Stage =====
FROM node:20-alpine AS build

WORKDIR /app

# React 빌드 시점 환경변수
ARG REACT_APP_SERVER_PORT
ENV REACT_APP_SERVER_PORT=${REACT_APP_SERVER_PORT}

# 의존성 설치
COPY package.json package-lock.json ./
RUN npm ci

# 소스 복사 및 빌드
COPY . .
RUN npm run build
