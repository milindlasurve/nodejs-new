#!/bin/bash

path=`pwd`

echo "path for getting yaml files for isurepay - $1ixc-iSurePay-apic-template/iSurePay-rest-proxy.git"

cd $path/Templates/YAML/iSurePay

git init
git remote add origin $1ixc-iSurePay-apic-template/iSurePay-rest-proxy.git
git pull origin master
sleep 3

cd $path/YAML/iSurePay
git init
git remote add origin $1ixc-iSurePay-apic-impl/iSurePay-rest-proxy.git
git pull origin master
sleep 3