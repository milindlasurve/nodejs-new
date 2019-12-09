#!/bin/bash

path=`pwd`

cd $path/YAML/eCollection/

echo "YAML path for pushing generated yaml $path/YAML/eCollection/"

git add *
git commit -m "committing new yaml file"
status=$(git push origin master 2>&1)
echo "$status commit status"

