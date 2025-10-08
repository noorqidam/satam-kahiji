import json
import boto3
import os
from datetime import datetime, timedelta

def handler(event, context):
    """
    Lambda function to create EBS snapshots and clean up old snapshots
    """
    ec2 = boto3.client('ec2')
    volume_id = os.environ['VOLUME_ID']
    retention_days = int(os.environ['RETENTION_DAYS'])
    name_prefix = os.environ['NAME_PREFIX']
    
    try:
        # Create snapshot
        snapshot_description = f"{name_prefix} database backup - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        
        response = ec2.create_snapshot(
            VolumeId=volume_id,
            Description=snapshot_description
        )
        
        snapshot_id = response['SnapshotId']
        
        # Tag the snapshot
        ec2.create_tags(
            Resources=[snapshot_id],
            Tags=[
                {
                    'Key': 'Name',
                    'Value': f"{name_prefix}-database-backup-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
                },
                {
                    'Key': 'Type',
                    'Value': 'automated-backup'
                },
                {
                    'Key': 'VolumeId',
                    'Value': volume_id
                },
                {
                    'Key': 'RetentionDays',
                    'Value': str(retention_days)
                }
            ]
        )
        
        print(f"Created snapshot {snapshot_id} for volume {volume_id}")
        
        # Clean up old snapshots
        cutoff_date = datetime.now() - timedelta(days=retention_days)
        
        snapshots = ec2.describe_snapshots(
            Filters=[
                {
                    'Name': 'tag:VolumeId',
                    'Values': [volume_id]
                },
                {
                    'Name': 'tag:Type',
                    'Values': ['automated-backup']
                }
            ],
            OwnerIds=['self']
        )
        
        deleted_count = 0
        for snapshot in snapshots['Snapshots']:
            snapshot_date = snapshot['StartTime'].replace(tzinfo=None)
            if snapshot_date < cutoff_date:
                try:
                    ec2.delete_snapshot(SnapshotId=snapshot['SnapshotId'])
                    print(f"Deleted old snapshot {snapshot['SnapshotId']}")
                    deleted_count += 1
                except Exception as e:
                    print(f"Failed to delete snapshot {snapshot['SnapshotId']}: {str(e)}")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': f'Backup completed successfully. Created snapshot {snapshot_id}, deleted {deleted_count} old snapshots.'
            })
        }
        
    except Exception as e:
        print(f"Error during backup: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': f'Backup failed: {str(e)}'
            })
        }