#!/bin/bash

# Controllo se ci sono abbastanza parametri
if [ "$#" -ne 3 ]; then
    echo "How To use: $0 <string_to_replace> <new_string> <directory>"
    exit 1
fi

# Assegna i parametri posizionali a variabili
CHECK="$1"
REPLACE="$2"
DIRECTORY="$3"

# Verifica se la directory esiste
if [ ! -d "$DIRECTORY" ]; then
    echo "Error: Directory '$DIRECTORY' doesn't exists."
    exit 1
fi

echo "Replacing $CHECK with $REPLACE into $DIRECTORY"

# Cerca i file contenenti la stringa e sostituisci
grep -rl "$CHECK" "$DIRECTORY" | xargs sed -i "" "s/$CHECK/$REPLACE/g"