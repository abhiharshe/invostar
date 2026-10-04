---
trigger: always_on
---

# Table name

- Each table name must be prefixed with **tbl_**
- Each table name must be in **plural** form & **lower case** with **snake_case**
- When Database is **PostgreSql** then always use **"schema.table"** format. Ask user to provide schema name & upon provided memorize it. Before creating table check for schema existance, if not exists then create schema.

# Default columns, data types & default values for each table

- **id**, bigint & auto incremented with primary key
- **is_active**, boolean & default true
- **created_at**, timestamp & default null
- **updated_at**, timestamp & default null
- **deleted_at**, timestamp & default null

 


