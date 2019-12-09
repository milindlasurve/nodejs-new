#!/bin/bash

client_code=$(echo $2)
git_url="$1ixc-devops"
echo "jenkins repo $1"

if [ ! -d "Templates/Jenkins/iSurePay" ]; then
    mkdir Templates/Jenkins/iSurePay
fi

path=`pwd`

cd $path/Templates/Jenkins/iSurePay/

git init
git remote add origin $git_url/devops-ace-iSurePay-testscripts.git
git pull origin master
sleep 3
