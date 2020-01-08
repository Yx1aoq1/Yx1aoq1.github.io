#!/usr/bin/env sh
hexo g
hexo d
git pull
git add .
git commit -m "update post"
git push origin hexo