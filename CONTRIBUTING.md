# Contribution guide

## Developing commitizen

You consider contributing changes to commitizen – thank you!
Please consider these guidelines when filing a pull request:

-   Commits follow the [Angular commit convention](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines)
-   4 spaces indentation
-   Features and bug fixes should be covered by test cases

## Creating releases

commitizen uses [semantic-release](https://github.com/semantic-release/semantic-release)
to release new versions automatically.

-   Commits of type `fix` will trigger bugfix releases, think `0.0.1`
-   Commits of type `feat` will trigger feature releases, think `0.1.0`
-   Commits with `BREAKING CHANGE` in body or footer will trigger breaking releases, think `1.0.0`

All other commit types will trigger no new release.

## Creating pull requests

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Please make sure to update tests as appropriate.
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (use `npm run commit` if you are not familiar with conventional commits)

-   Please refrain from committing all changes at once. [Make git commits atomically](https://www.aleksandrhovhannisyan.com/blog/atomic-git-commits/).

4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
