"""Auto-logging middleware for ChangeLog entries."""
from app import db
from app.models import ChangeLog


from app.events import event_bus

def log_change(project_id, entity_type, entity_id, action,
               field_changed='', old_value='', new_value='', changed_by='system'):
    """Create a ChangeLog entry for any mutation."""
    entry = ChangeLog(
        project_id=project_id,
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        field_changed=field_changed,
        old_value=str(old_value) if old_value else '',
        new_value=str(new_value) if new_value else '',
        changed_by=changed_by,
    )
    db.session.add(entry)
    db.session.flush() # ensure ID is set
    
    # Broadcast the changelog created event
    event_bus.broadcast('changelog_created', entry.to_dict())


def log_field_changes(project_id, entity_type, entity_id, old_dict, new_dict, changed_by='system'):
    """Compare old and new dicts and log each changed field."""
    for key in new_dict:
        if key in old_dict and str(old_dict[key]) != str(new_dict[key]):
            log_change(
                project_id=project_id,
                entity_type=entity_type,
                entity_id=entity_id,
                action='updated',
                field_changed=key,
                old_value=old_dict[key],
                new_value=new_dict[key],
                changed_by=changed_by,
            )
