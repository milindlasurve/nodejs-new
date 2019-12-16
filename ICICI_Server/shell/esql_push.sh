#!/bin/bash

path=`pwd`
esqlTemplateRepo=$1
client_code=$2

echo "git repo for pushing esql file $path/Templates/$esqlTemplateRepo"_"$client_code"
cd $path/Templates/$esqlTemplateRepo"_"$client_code

sleep 3
git add *
git commit -m "committing for the "
status=$(git push origin master 2>&1)
echo "$status commit status"

# for deleting folder
path=`pwd`
echo "esql folder delete path = > $path"
# rm -rf $path/Templates/$esqlTemplateRepo"_"$client_code