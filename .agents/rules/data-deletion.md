---
trigger: always_on
---

# Data deletion policy

- Always use **soft_deletes** policy in the system, to apply this update the column **deleted_at** with the timestamp and send the timestamp from the code-behind.
- While fetching the records from a database table, showing list of records, fetching records while creation of another dependent table etc, always fetch the records which are not deleted meaning **deleted_at** column must be **null**.