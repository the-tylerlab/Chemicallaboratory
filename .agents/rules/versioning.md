# Versioning and Changelog Rule

**Description**:
The user has requested that before any push to GitHub, the application version history must be updated in the application's UI, especially for major changes.

**Instructions**:
1. When significant or "major" changes are made (e.g., new features, large architectural changes like adding/removing PWA, UI overhauls), bump the application version number.
2. Locate the version badge in the sidebar (e.g., in `index.html` look for `#versionBadge`). Update this to the new version.
3. Locate the Version History Modal (e.g., in `index.html` look for the "ประวัติการอัปเดตระบบ" modal or `v1.9.x` comments).
4. Add a new changelog entry at the top of the version history list in the modal with the new version number, the current date (in Thai format, e.g., "24 สิงหาคม 2569"), and a bulleted list of the major changes made.
5. Do this *before* you run any `git push` command or advise the user to push to GitHub.
