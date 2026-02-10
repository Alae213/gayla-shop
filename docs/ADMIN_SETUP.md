# Admin User Setup

## Create Initial Admin

After completing Phase 0 setup, create the admin user:

```bash
npm run setup:admin
```

This will create an admin account with:

- **Email:** admin@gayla.dz
- **Password:** Gayla2026!

⚠️ **IMPORTANT:** Change this password immediately after first login!

## Login

1. Navigate to `/admin` and use the credentials above.

## Change Password

1. Log in to the admin dashboard.
2. Go to **Settings**.
3. Enter your current password.
4. Enter your new password (min 8 characters).
5. Save changes.

## Troubleshooting

If you need to reset the admin password:

1. Delete the admin user from the Convex dashboard.
2. Run `npm run setup:admin` again.
