# SMMExpertService Storefront v10.4.1

## macOS case-collision hotfix

- Unified homepage feature components under `src/components/home/`.
- Moved `Hero.tsx` from `src/components/Home/` to `src/components/home/`.
- Updated homepage and verifier imports to the canonical lowercase path.
- Removed the `Home` vs `home` directory collision that caused TypeScript TS1261 on case-insensitive filesystems such as default macOS APFS.
- Added a regression check that fails verification if top-level component folders differ only by case.

All existing v10.4 functionality is preserved.
