"""Schemas and constants for Node metadata."""

# Node metadata schema for 'table' nodes in db_diagrams
TABLE_NODE_COLUMNS_SCHEMA = {
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "name": {"type": "string", "description": "Column name"},
            "type": {"type": "string", "description": "Data type (e.g. VARCHAR, INT)"},
            "is_pk": {"type": "boolean", "default": False, "description": "Is Primary Key?"},
            "is_fk": {"type": "boolean", "default": False, "description": "Is Foreign Key?"},
            "ref": {"type": "string", "description": "Reference to another table/column if is_fk is true"}
        },
        "required": ["name"]
    }
}

# Example structure for Node.meta when node_type is 'table':
# {
#   "columns": [
#     {"name": "id", "type": "INTEGER", "is_pk": True},
#     {"name": "user_id", "type": "INTEGER", "is_fk": True, "ref": "users.id"}
#   ]
# }
