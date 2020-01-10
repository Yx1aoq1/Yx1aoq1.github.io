#!/usr/bin/env sh
hexo g
hexo d
git pull
git add --all
git commit -m "update post"
git push origin hexo
pm2 restart hexo