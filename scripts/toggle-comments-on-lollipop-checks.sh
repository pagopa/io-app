#!/bin/zsh

# Check if the action and file path are provided
if [ $# -ne 2 ]; then
  echo "Usage: $0 [comment|uncomment] [path_to_file]"
  exit 1
fi

ACTION="$1"
FILE="$2"

# Ensure the file exists
if [ ! -f "$FILE" ]; then
  echo "File not found: $FILE"
  exit 1
fi

comment_block() {
  local start_marker="$1"
  local end_marker="$2"
  sed -E -i '' "/$start_marker/,/$end_marker/ {
    /$start_marker/b
    /$end_marker/b
    s/^\s*/  \/\/ /g
  }" "$FILE"
}

uncomment_block() {
  local start_marker="$1"
  local end_marker="$2"
  sed -E -i '' "/$start_marker/,/$end_marker/ {
    /$start_marker/b
    /$end_marker/b
    s/^(  \/\/ )*//g
  }" "$FILE"
}

FIRST_BLOCK_START="#LOLLIPOP_CHECK_BLOCK1_START"
FIRST_BLOCK_END="#LOLLIPOP_CHECK_BLOCK1_END"
SECOND_BLOCK_START="#LOLLIPOP_CHECK_BLOCK2_START"
SECOND_BLOCK_END="#LOLLIPOP_CHECK_BLOCK2_END"
if [ "$ACTION" = "comment" ]; then
  comment_block $FIRST_BLOCK_START $FIRST_BLOCK_END
  comment_block $SECOND_BLOCK_START $SECOND_BLOCK_END
  echo "Code blocks commented in $FILE."
elif [ "$ACTION" = "uncomment" ]; then
  uncomment_block $FIRST_BLOCK_START $FIRST_BLOCK_END
  uncomment_block $SECOND_BLOCK_START $SECOND_BLOCK_END
  echo "Code blocks uncommented in $FILE."
else
  echo "Invalid action: $ACTION"
  echo "Usage: $0 [comment|uncomment] [path_to_file]"
  exit 1
fi
