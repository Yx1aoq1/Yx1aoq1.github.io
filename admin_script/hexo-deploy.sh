#!/usr/bin/env sh
hexo clean
hexo g -d
git pull
git add --all
git commit -m "update post"
git push origin hexo
pm2 restart hexo