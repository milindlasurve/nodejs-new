#!/bin/bash

gitRemoteURL=$1
gitRemoteToken=$3
esqlTemplateGitRepo=$4
client_code=$(echo $5)
gitOrgName=$6
git_url="$gitRemoteURL"
echo "remote git url $git_url"
echo "Organization Name $gitOrgName"
if [ ! -d "Templates/ESQL" ]; then
    mkdir Templates/ESQL
fi

cd Templates/ESQL

folder1=$(echo $esqlTemplateGitRepo | awk -F'/' '{print $NF}' | awk -F'.git' '{print $1}')

status=$(git clone $esqlTemplateGitRepo "$folder1"_"$client_code" 2>&1)
echo "this is git clone status $status"

cd "./$folder1"_"$client_code"
curl -X POST "$2api/v1/org/$gitOrgName/repos?access_token=$gitRemoteToken" -H "accept: application/json" -H "Content-Type: application/json" -d "{ \"name\": \""$folder1"_"$client_code"\"}"
if [ "$?" -eq 0 ]; then
    echo "GIT REPO CREATED SUCCESSFULLY............"
    $(echo pwd)
    testRepo=$git_url$gitOrgName 
    echo "testing TestRepo $testRepo"
    git remote set-url origin $git_url$gitOrgName"/"$folder1"_"$client_code".git"
    status=$(git push origin master 2>&1)
    if [ "$?" -ne 0 ]; then
        echo "fail to push into the repo...$status"
    fi
fi
