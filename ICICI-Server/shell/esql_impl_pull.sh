url="$1ixc-ace-eCollection-impl/$2.git"

cd IMPLs/ESQL

status=$(git clone $url 2>&1)
echo "this is git clone status from esql_impl_pull file $status"