#!/bin/bash

path=`pwd`

cd $path/Templates/Jenkins/$1/
echo "path to push data = $path/Templates/Jenkins/$1/"

git add *
git commit -m "committing new eCollection test file"
status=$(git push origin master 2>&1)
echo "$status commit status"