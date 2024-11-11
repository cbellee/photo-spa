source ./.env

# replace tokens in apiConfig_template.js with actual values
sed "s/{{AZURE_TENANT_ID}}/$AZURE_TENANT_ID/g ; \
    s/{{STORAGE_ACCOUNT_NAME}}/$STORAGE_ACCOUNT_NAME/g ; \
    s/{{STORAGE_ACCOUNT_SUFFIX}}/$STORAGE_ACCOUNT_SUFFIX/g ; \
    s/{{PHOTO_APP_ENDPOINT_URI}}/$PHOTO_APP_ENDPOINT_URI/g" \
    ./src/config/apiConfig_template.js > ./src/config/apiConfig.js

# build javascript
npm run build

# enable azure storage static website
az storage blob service-properties update --account-name $STORAGE_ACCOUNT_NAME --static-website --index-document index.html --404-document index.html

# upload to Azure Blob Storage
az storage azcopy blob upload --container '$web' --account-name $STORAGE_ACCOUNT_NAME --source './dist/*' --recursive
