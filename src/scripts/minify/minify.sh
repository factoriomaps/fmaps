#!/bin/bash

CURRENT_VERSION="2.0.0"

CURRENTSCRIPT="$(readlink -e $0)"
SCRIPTNAME="$(basename ${CURRENTSCRIPT})"
[ -z "${CURRENTSCRIPT}" ] && echo "Unable to find current script name" && exit 1
DIR="$(dirname ${CURRENTSCRIPT})"
[ -z "${DIR}" ] && echo "Unable to find parent directory" && exit 2

OLD_CWD="$(pwd)"

cd "${DIR}/../../../"

ASSET_PATH="public/assets"

FOLDERS=("${ASSET_PATH}/js/browse/${CURRENT_VERSION}/" "${ASSET_PATH}/js/leaflet/edit/${CURRENT_VERSION}/" "${ASSET_PATH}/js/leaflet/map/${CURRENT_VERSION}/" "${ASSET_PATH}/js/nav/${CURRENT_VERSION}/" "${ASSET_PATH}/css/browse/${CURRENT_VERSION}/" "${ASSET_PATH}/css/leaflet/edit/${CURRENT_VERSION}/" "${ASSET_PATH}/css/leaflet/map/${CURRENT_VERSION}/" "${ASSET_PATH}/css/nav/${CURRENT_VERSION}/")

for p in "${FOLDERS[@]}"; do
    [ ! -d "${p}" ] && mkdir -p "${p}"
done

uglifyjs src/js/browse/main.js -m > "${ASSET_PATH}/js/browse/${CURRENT_VERSION}/browse.js"
uglifyjs src/js/maps/edit.js -m > "${ASSET_PATH}/js/leaflet/edit/${CURRENT_VERSION}/map.js"
uglifyjs src/js/maps/show.js -m > "${ASSET_PATH}/js/leaflet/map/${CURRENT_VERSION}/map.js"
uglifyjs src/js/nav/BurgerKing.js -m > "${ASSET_PATH}/js/nav/${CURRENT_VERSION}/BurgerKing.js"

uglifycss src/css/browse/main.css > "${ASSET_PATH}/css/browse/${CURRENT_VERSION}/browse.css"
uglifycss src/css/maps/edit.css > "${ASSET_PATH}/css/leaflet/edit/${CURRENT_VERSION}/map.css"
uglifycss src/css/maps/show.css > "${ASSET_PATH}/css/leaflet/map/${CURRENT_VERSION}/map.css"
uglifycss src/css/nav/BurgerKing.css > "${ASSET_PATH}/css/nav/${CURRENT_VERSION}/BurgerKing.css"

cd "${OLD_CWD}"
