#!/bin/bash

path=`pwd`

cd $path/Templates/Jenkins/iSurePay/

git add *
git commit -m "committing new isurepay test file"
status=$(git push origin master 2>&1)
echo "$status commit status"