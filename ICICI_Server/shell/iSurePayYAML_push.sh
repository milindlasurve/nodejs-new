#!/bin/bash

path=`pwd`

cd $path/YAML/iSurePay/

echo "YAML path for pushing generated yaml $path/YAML/iSurePay/"

git add *
git commit -m "committing new isurepay yaml file"
status=$(git push origin master 2>&1)
echo "$status commit status"

# For deleting iSurePay folder

# rm -rf $path/YAML/iSurePay/

