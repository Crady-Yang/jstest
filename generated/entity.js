export const Entity = {
    "user_role_mapping": {
        "Id": {
            "nullable": false,
            "type": "string",
            "comment": "",
            "defaultValue": null,
            "ifIdField": true,
            "maxLength": 36
        },
        "RoleId": {
            "nullable": false,
            "type": "string",
            "comment": "",
            "defaultValue": null,
            "ifIdField": false,
            "maxLength": 36
        },
        "UserId": {
            "nullable": false,
            "type": "string",
            "comment": "",
            "defaultValue": null,
            "ifIdField": false,
            "maxLength": 36
        }
    }
}