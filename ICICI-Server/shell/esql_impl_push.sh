#!/bin/bash

path=`pwd`

cd $path/IMPLs/ESQL/$1/

git add *
git commit -m "committing new test file"
status=$(git push origin master 2>&1)
echo "$status commit status"