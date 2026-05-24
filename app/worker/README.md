# Backlify Worker

The Backlify Worker is the core execution engine responsible for handling
database backup and restore operations asynchronously.

It processes queued jobs, executes PostgreSQL backup/restore commands,
manages backup files, and updates job statuses independently from the API layer.

---

## Responsibilities

The worker handles:

- PostgreSQL backups using `pg_dump`
- PostgreSQL restores using `pg_restore`
- Background job processing
- Retry handling
- Backup file generation
- Temporary file management
- Backup status updates
- Restore status updates

---

## Architecture Role

The worker operates separately from the main Next.js application.

```txt
Next.js API
    ↓
Redis Queue
    ↓
Worker
    ↓
pg_dump / pg_restore
    ↓
Local Storage / Cloud Storage