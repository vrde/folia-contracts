#!/bin/bash
rm -f flat/**/*.sol

# for filename in contracts/**/*.sol; do
#     [ -e "$filename" ] || continue
#     npx truffle-flattener "$filename" > flat_"$filename"
# done

# find contracts -type f \( -name '*.sol' \) \
#     -exec npx truffle-flattener {} > flat_contracts/ \;


find contracts -name "*.sol" -print0 | while read -d $'\0' file
do
  printf " \n%s\n" $file
  npx poa-solidity-flattener "$file"
done