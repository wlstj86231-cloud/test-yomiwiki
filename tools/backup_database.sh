#!/bin/bash

# YomiWiki D1 Database Backup Script
DB_NAME="yomi-db"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="${BACKUP_DIR}/yomiwiki_backup_${TIMESTAMP}.sql"
RETENTION_DAYS=30

# 폴더 생성
mkdir -p $BACKUP_DIR

echo "[SYSTEM_MESSAGE] Initiating archival backup for ${DB_NAME}..."

# Wrangler를 통한 D1 데이터 내보내기 (SQL 형식)
# --remote 플래그는 실제 운영 DB를 의미함
if npx wrangler d1 export $DB_NAME --remote --output=$FILENAME; then
    echo "[SUCCESS] Archival data secured at ${FILENAME}"
    
    # 34. [Backup Rotation] Delete backups older than RETENTION_DAYS
    echo "[SYSTEM_MESSAGE] Pruning obsolete archives older than ${RETENTION_DAYS} days..."
    find $BACKUP_DIR -name "yomiwiki_backup_*.sql" -type f -mtime +$RETENTION_DAYS -delete
    
    echo "[COMPLETE] Maintenance sequence finalized."
else
    echo "[CRITICAL_FAILURE] Backup sequence aborted. Check Wrangler configuration or network uplink."
    exit 1
fi
