#!/bin/bash

babel src --out-dir build
sftp {SERVER_NAME} <<EOF
cd {FOLDER_NAME}
put -r www/.
EOF
