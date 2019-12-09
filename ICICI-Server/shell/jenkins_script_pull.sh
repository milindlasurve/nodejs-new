#!/bin/bash

git_url="$1ixc-devops"

if [ ! -d "Templates/Jenkins/eCollection" ]; then
    mkdir Templates/Jenkins/eCollection
fi

path=`pwd`

cd $path/Templates/Jenkins/eCollection/

git init
git remote add origin $git_url/devops-ace-eCollection-testscripts.git
git pull origin master
sleep 3
