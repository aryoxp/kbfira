# Setup Kit-Build System

This documentation applies to Kit-Build System version 2.x. The first version of Kit-Build system uses CoreFramework to be installed and setup separately. But on version 2, the CoreFramework is embedded into the Kit-Build system.



## Important Information to Know

Source code

Main git repository address: https://github.com/aryoxp/kbfira.git
Branch: `master`



**Current Example: **

Subdirectory in the URL when accessing this Kit-Build system: `fira`
Document Root location: `/var/www/fira/html`

> **Notes:**
>
> *Change any of the values to reflect your desired/expected configuration/settings*.



## Prerequisites

Before installing and setup the Kit-Build system the following information is necessary:

- Apache or Nginx web server which has a directory of Document Root prepared for the Kit-Build system. By default it is located at `/var/www/html` but yours may be different. PHP script should be enabled in this directory. The directory should have permission of `755` and owned by user that manage the system (non-root).

  In this document, Nginx will be used.

- Ubuntu server non-root user with sudo enabled (Ubuntu server administrator).

- PHP-FPM version 8.1 and MySQL 8.0 is installed and configured.

- For MySQL, `root` user or other user with `ALL` privileges with `GRANT` option (allowed to execute `CREATE DATABASE`  and `GRANT` queries).

- `mysql` command line installed, so that mysql command can be executed from command line. To check whether this command is installed, open Terminal/Command Prompt window and type:

  ````sh
  mysql
  ````

  Messages except something like "*command not found*" should be displayed if `mysql` client is installed.

  > On Windows OS as the server OS, open Command Prompt window on the directory where `mysql.exe` is located.



## Preparing Empty MySQL Database Server for Kit-Build System

To prepare a new database for Kit-Build system, execute the following commands from server command line. If you are currently on a client computer (different computer/host with server) use SSH to connect to server command line.

1. Open server terminal using SSH or Putty and login with the non-root and sudo enabled user.
   In this example:

   username: `aryo`
   password: `123`

   Server is Ubuntu server on `localhost` (VirtualBox) port forwarded from 2222 (Host) to 22 (Guest):

   ````shell
   $ ssh aryo@localhost -p 2222
   aryo@localhost's password: 
   ...
   ````

   If you connect to online `kit-build.net` server (SSH default port is 22), use:

   ````sh
   $ ssh username@kit-build.net
   username@kit-build.net password: 
   ...
   ````

2. Enter the MySQL server using `mysql` client command. The following connection parameter may be different according to the configured settings during server installation.

   User: `root`

   Password: `root`

   Host: `127.0.0.1` or `localhost`

   Port: `3307`

   ````shell
   $ mysql -u root -p -h 127.0.0.1 -P 3306
   Enter password: 
   Welcome to the MySQL monitor.  Commands end with ; or \g.
   Your MySQL connection id is 10
   Server version: 8.0.28 MySQL Community Server - GPL
   
   Copyright (c) 2000, 2022, Oracle and/or its affiliates.
   
   Oracle is a registered trademark of Oracle Corporation and/or its
   affiliates. Other names may be trademarks of their respective
   owners.
   
   Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
   
   mysql> 
   
   ````

3. From the following step and onward, the following commands are executed from the MySQL client `mysql>` prompt.

   The configuration uses the following information example for the Kit-Build system configuration:

   database: `kbv2-fira`
   username: `kbv2user`
   password: `kbv2userpass`

   - Show existing databases in database server

     ````mysql
     SHOW DATABASES;
     ````

     ````sh
     mysql> SHOW DATABASES;
     +--------------------+
     | Database           |
     +--------------------+
     | information_schema |
     | mysql              |
     | performance_schema |
     | sys                |
     +--------------------+
     4 rows in set (0.01 sec)
     
     ````

     Ensure that the database name, `kbv2-fira`, which will be used for the new KitBuild system, does not exists.

   - Create new empty database with utf8mb4 character set, to allow the database to store multibyte character such as Japanese kanji character.

     ````sql
     CREATE DATABASE `kbv2-fira` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
     ````

     ````shell
     mysql> CREATE DATABASE `kbv2-fira` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
     Query OK, 1 row affected (0.00 sec)
     ````

   - Create user for the new Kit-Build system to connect and use the newly created database:

     ````mysql
     CREATE USER 'kbv2user'@'localhost' IDENTIFIED BY 'kbv2userpass';
     ````

     ````shell
     mysql> CREATE USER 'kbv2user'@'localhost' IDENTIFIED BY 'kbv2userpass';
     Query OK, 0 rows affected (0.01 sec)
     ````

   - Also create a user with the same name to allow connection from outside server using other MySQL client application (e.g., MySQL Workbench or Jetbrains DataGrip) for easy maintenance and data management.

     ````mysql
     CREATE USER 'kbv2user'@'%' IDENTIFIED BY 'kbv2userpass';
     ````

     ````shell
     mysql> CREATE USER 'kbv2user'@'%' IDENTIFIED BY 'kbv2userpass';
     Query OK, 0 rows affected (0.01 sec)
     ````

   - Grant all privileges to the user on the database.

     ````mysql
     GRANT ALL PRIVILEGES ON `kbv2-fira`.* TO `kbv2user`@`localhost`;
     GRANT ALL PRIVILEGES ON `kbv2-fira`.* TO `kbv2user`@`%`;
     ````

     ````shell
     mysql> GRANT ALL PRIVILEGES ON `kbv2-fira`.* TO `kbv2user`@`localhost`;
     Query OK, 0 rows affected (0.00 sec)
     
     mysql> GRANT ALL PRIVILEGES ON `kbv2-fira`.* TO `kbv2user`@`%`;
     Query OK, 0 rows affected (0.01 sec)
     ````

   - Apply the new user configuration to be effective.

     ````mysql
     FLUSH PRIVILEGES;
     ````

     ````shell
     mysql> FLUSH PRIVILEGES;
     Query OK, 0 rows affected (0.01 sec)
     ````

   - Check the database, ensure that `kbv2-fira` database is listed.

     ````mysql
     mysql> SHOW DATABASES;
     +--------------------+
     | Database           |
     +--------------------+
     | information_schema |
     | kbv2-fira          |
     | mysql              |
     | performance_schema |
     | sys                |
     +--------------------+
     5 rows in set (0.00 sec)
     ````

   - Exit the MySQL client and go back to Ubuntu server terminal.

     ````mysql
     mysql> QUIT;
     Bye
     ````

4. Test the new user and password to connect to the database.

   ````bash
   $ mysql -u kbv2user -p -h 127.0.0.1 -P 3306
   Enter password: 
   Welcome to the MySQL monitor.  Commands end with ; or \g.
   Your MySQL connection id is 12
   Server version: 8.0.28 MySQL Community Server - GPL
   
   Copyright (c) 2000, 2022, Oracle and/or its affiliates.
   
   Oracle is a registered trademark of Oracle Corporation and/or its
   affiliates. Other names may be trademarks of their respective
   owners.
   
   Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
   
   mysql> 
   
   ````

5. Check the database.

   ````mysql
   mysql> SHOW DATABASES;
   +--------------------+
   | Database           |
   +--------------------+
   | information_schema |
   | kbv2-fira          |
   +--------------------+
   2 rows in set (0.00 sec)
   ````

   The database `kbv2-fira` should be listed when connecting to database with this user.

6. Exit the MySQL client and go back to Ubuntu server terminal.

   ````mysql
   mysql> QUIT;
   Bye
   ````





## Preparing Document Root for The New Kit-Build System

In this document, the planned document root location for the new Kit-Build system is located at:

````shell
/var/www/fira/html
````

While the default Document Root is located at:

````sh
/var/www/html
````



1. Create the directory for the document root.

   ````bash
   sudo mkdir -p /var/www/fira/html
   ````

2. Change the owner of the document root user to current user

   ````bash
   sudo chown -R $USER:$USER /var/www/fira/html
   ````





## Configure Nginx to Serve the New Document Root

In this document the planned Kit-Build system should be accessible from `/fira` sub-directory of the main host, as such:

````http
http://example.com/fira
````

1. Modify the nginx default configuration file using `vi` or `nano`

   ````bash
   sudo vi /etc/nginx/sites-available/default
   ````

2. Add the following code at the end of the  `server` block:

   ````bash
   server {
     ...
     location ^~ /fira {
       # set the document root
       alias /var/www/fira/html;
       
       # deny access to shared PHP libraries
       location ^~ /fira/.shared {
         deny all;
         return 404;
       }
       
       # deny access to CoreFramework
       location ^~ /fira/core {
         deny all;
         return 404;
       }
       
       # allow access only to CoreFramework client assets
       location ^~ /fira/core/asset {
         allow all;
       }
       
       # process requests of PHP file to PHP-FPM socket.
       location ~* \.php(/.*)? {
         include snippets/fastcgi-php.conf;
         fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
         fastcgi_param SCRIPT_FILENAME $request_filename;
         fastcgi_param DOCUMENT_ROOT $realpath_root;
       }
     }
     ...
   }
   
   ````

3. Test the new configuration

   ````sh
   sudo nginx -t
   ````

   ````bash
   $ sudo nginx -t
   nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
   nginx: configuration file /etc/nginx/nginx.conf test is successful
   ````

4. Restart Nginx server

   ````bash
   sudo systemctl restart nginx
   ````

   









## Download The Kit-Build System Source Code

Download the Kit-Build System source code to the prepared document root directory

1. Change the current working directory to the document root directory:

   ````bash
   cd /var/www/fira/html
   ````

2. Clone the following git URL (don't forget the last dot "." character):

   ````shell
   git clone --single-branch --branch master https://github.com/aryoxp/kbfira.git .
   ````

   ````bash
   $ git clone --single-branch --branch master https://github.com/aryoxp/kbfira.git .
   Cloning into '.'...
   remote: Enumerating objects: 2665, done.
   remote: Counting objects: 100% (736/736), done.
   remote: Compressing objects: 100% (452/452), done.
   remote: Total 2665 (delta 376), reused 594 (delta 258), pack-reused 1929
   Receiving objects: 100% (2665/2665), 6.66 MiB | 3.67 MiB/s, done.
   Resolving deltas: 100% (707/707), done.
   ````

   

   >**Notes:**
   >
   >Another way to have the system source code is to upload the system source code directly from your computer (*especially if you modify the source code and develop your own Kit-Build system*) to the target document root directory using FTP/SFTP (e.g., FileZilla or any other FTP/SFTP client program) or copy another Kit-Build system project files to the target directory.

   

3. Once you have the system source code in the document root, test the system by accessing the "home" page of Kit-Build system.

   ````http
   http://localhost:8081/fira/index.php/home
   ````

   If the configured port number is 80 (default port of HTTP server), you can ommit the port part from the URL like so:

   ````http
   http://localhost/fira/index.php/home
   ````

   Change `localhost` to the actual hostname of the server.

   ![home](/Users/aryo/Nginx/kb/docs/dev/images/home.png)

   If you can see similar pages like in the above example, the Nginx configuration has been setup successfully.



## Configuring The Kit-Build System



### Database Configuration

Configure the database settings to point the new database. According to the settings, the following parameters are used:

configuration key/identifier: `kbv2-fira` (you can use any name)

database: `kbv2-fira`
username: `kbv2user`
password: `kbv2userpass`
port: `3306`
host: `localhost` or `127.0.0.1` (as PHP/Nginx and MySQL server are located at the same host)
charset: `utf8mb4`
collate: `utf8mb4_general_ci`



> Change the values to match your settings and the following configuration files should be modified at server, not on your development computers.

1. Create a new database setting entry on the following file:

   ````shell
   /.shared/config/db.ini
   ````

   Add the following configuration entry block at the bottom of the `db.ini` file:

   ````ini
   ...
   
   [kbv2-fira]
   driver     = "mysqli"
   host       = "127.0.0.1"
   port       = "3306"
   user       = "kbv2user"
   password   = "kbv2userpass"
   database   = "kbv2-fira"
   charset    = "utf8mb4"
   collate    = "utf8mb4_general_ci"
   persistent = false
   ````

   > You can copy-paste the `[_example]` block settings and change the necessary fields.

2. Create or edit the general configuration file:

   ````bash
   /.shared/config/config.ini
   ````

   Add or modify the following entry to match with your database setting key. In this documentation, it is set to `kbv2-fira`.

   ````ini
   default_db_key = "kbv2-fira"
   ````

   This way, the default connection of MySQL database in Services' queries will be pointed to `kbv2-fira` database.



### Database Structure Setup

Configure the database settings to point the new database. According to the settings, the following parameters are used:

````ini
default_db_key = "kbv2-fira"
````

Therefore, the setup will target database connection defined on `kbv2-fira`. Follow below steps to setup and initial configure of Kit-Build system database and create Administrator user on the system database.

1. Open the following setup page:

   ````http
   http://localhost:8081/fira/index.php/admin/m/x/app/setup
   ````

   Change the hostname `localhost:8081` to match your configuration, and you will get the following page.

   ![setup-page](/Users/aryo/Nginx/kb/docs/dev/images/setup-page.png)

   

2. Select the target database configuration from the drop down list, in this case `kbv2-fira`.

3. Verify that the hostname, port, user, password, and database value are correct.

   If the configuration is correct and the target database is empty, the system will display:

   `Selected database is empty and ready to setup`.

   You cannot setup Kit-Build system on non-empty database for safety. Otherwise, it will show whether the database is not empty or the configuration is invalid. Make changes as necessary.

4. Click the [**Begin Database Setup**] button to begin setup.
   On successful setup, the setup page will show:

    `Database has been successfully set up` 

   message.

5. Proceed to set database initial data by clicking the [**Set Initial Data**] button to perform initial data setup after database structure has been created.

   > Clicking this button will try to create an Administrator account `admin` without password to the selected database. If `admin` user exists, it will remove the password.

   On successful setup, it will show:

   `Initial data has been setup successfully.`



### Start Using The Kit-Build System

The Kit-Build system has been setup and you may now use the Kit-Build system.

Click the "Dashboard" menu on the sidebar and click the [**Sign In**] button to begin the sign-in process and logging in as Administrator using the following username and password:

username: `admin`
password: `<empty>` (no password)

and click the [**Sign in**] button.

<img src="/Users/aryo/Nginx/kb/docs/dev/images/sign-in.png" alt="sign-in" style="zoom:50%;" />

7. Congratulations! You are now ready to use Kit-Build.

   ![admin-dashboard](/Users/aryo/Nginx/kb/docs/dev/images/admin-dashboard.png)

   以上です。























