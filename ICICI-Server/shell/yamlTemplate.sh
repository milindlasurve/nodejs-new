#!/bin/bash

path=`pwd`

echo "path for getting yaml files - $path"

cd $path/Templates/YAML/eCollection

git init
git remote add origin $1ixc-eCollection-apic-template/eCollection-rest-proxy.git
git pull origin master
sleep 3

cd $path/YAML/eCollection
git init
git remote add origin $1ixc-eCollection-apic-impl/eCollection-rest-proxy.git
git pull origin master
sleep 3