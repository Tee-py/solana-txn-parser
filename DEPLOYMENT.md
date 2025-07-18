## Deployment Checklist
- run tests with `npm test`
- build package with `npm run build`
- update the package.json file with new version
- run `npm pack --dry-run` and inspect the .tgz contents
- create tarball (.tgz) using `npm pack`
- create an external project and test the package using the tarball
- publish the package to npm `npm publish`
- create a new tag and release with the tarball on github
