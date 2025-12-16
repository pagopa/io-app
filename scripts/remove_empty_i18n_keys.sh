#!/bin/bash

# Function to display the usage of the script
display_usage() {
    echo "Usage: $0 <input_file>"
    echo
    echo "<input_file> - Path to the YAML file you want to process."
    echo
    exit 1
}

# Check if the number of arguments is not 1
if [ $# -ne 1 ]; then
    display_usage
fi

# Check if the user asked for help
if [[ $1 == "--help" || $1 == "-h" ]]; then
    display_usage
fi

INPUT_FILE=$1

# Function to iteratively remove empty arrays and objects
cleanup_cycle() {
    while true; do
        # Get a checksum before making changes
        BEFORE_CHANGE=$(md5sum "$INPUT_FILE" | awk '{print $1}')

        # Delete keys that are empty arrays or objects
        yq e -i 'del( .. | select(tag == "!!map" and length == 0))' "$INPUT_FILE"

        # Get a checksum after making changes
        AFTER_CHANGE=$(md5sum "$INPUT_FILE" | awk '{print $1}')

        # If no changes occurred, exit the function
        if [ "$BEFORE_CHANGE" == "$AFTER_CHANGE" ]; then
            break
        fi
    done
}

# Perform the cleanup
cleanup_cycle

echo "Processed file has been saved as $INPUT_FILE."
