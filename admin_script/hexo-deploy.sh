#!/usr/bin/env sh
hexo g
hexo d
hexo b
git pull
git push