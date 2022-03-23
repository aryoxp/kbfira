# System Configuration

Kit-Build system has several configurations located in several directories, including application's own config directory. The following configuration level applies to application running to the Kit-Build system:

- Core
- Shared
- Application

Shared configuration takes precedence over Core configuration and Application's configuration takes precedence over Core and Shared configuration. That is, a same configuration name defined in Core will be replaced by Shared and shall be replaced by Application config value. Therefore Application's configuration takes the highest priority over others.

However, configuration settings defined in Core applies to Core, Shared, and Application level. Configuration settings defined in Shared applies to both Shared libraries and Application. While settings defined at Application level only applies to that level.

Refer to the following table for the configuration locations:

| Type   | Function                                                     | Location                     |
| ------ | ------------------------------------------------------------ | ---------------------------- |
| Core   | Framework settings                                           | `/core/core.config.ini`      |
|        | Plugins (Client Javascript libraries collection). These libraries are needed by CoreFramework's client library for client-server communication. | `/core/config/plugins.ini`   |
| Shared | General config                                               | `/.shared/config/config.ini` |
|        | Database connection settings collection                      | `/.shared/config/db.ini`     |



## Accessing Configuration Entries

Use Core
