# doesitwork
Web app for reporting functionality/non-functionality of community-maintained services (washing machines, microwaves, etc etc)

## Server Configuration
Basic configuration is done using environment variables or a .env file in the server root.

```
# MongoDB Config
MONGO_HOST=<DB IP, default localhost>
MONGO_PORT=<DB PORT, default 27017>
MONGO_USER=<DB USER, default none>
MONGO_PASS=<DB PASSWORD, default none>
MONGO_TLS=<DB TLS (yes/no), default no>

# Root user initial setup
ROOT_USER=<INITIAL ROOT USERNAME, default admin>
ROOT_PASS=<INITIAL ROOT PASSWORD, default admin>

# Customization
CUSTOM_ORG=<ORGANIZATION NAME, default none>
CUSTOM_BRAND=<ORGANIZATION BRAND COLOR, default #6b4493 (https://colorpicker.me/#6b4493)>
```