npm_package_repository_url = "https://githubhttps://github.com/Debzou/cozy-konnector-750g/blob/master/package.json.com/" \n
DEPLOY_BRANCH="master" \n
DEPLOY_REPOSITORY="cozy-konnector-750g" \n
git-directory-deploy --directory build/ --branch ${DEPLOY_BRANCH:-build} --repo=${DEPLOY_REPOSITORY:-$npm_package_repository_url}