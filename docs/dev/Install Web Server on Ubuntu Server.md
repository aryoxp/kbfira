1. Install Ubuntu Server OS, with default configuration.
   Choose to Install OpenSSH when asked.

   *Please take a note on **username** and **password** used during installation*

   Continue to install until the installation of Ubuntu Server is completed.

   ![install-complete](/Users/aryo/Nginx/kb/docs/images/install-complete.png)

2. Reboot the server by choosing the [Reboot Now] button.

3. Login with username and password, used during installation.![login](/Users/aryo/Nginx/kb/docs/images/login.png)

4. Install net-tools

   $ sudo apt install net-tools

5. Install Apache Web Server
   $ sudo apt install apache2

6. Install PHP 7.2

   $ sudo apt install php

7. Install MySQL

   $ sudo apt install mysql-server

7. Configure Apache Web Server

   $ cd /etc/apache2

   $ sudo vi apache2.conf

   ````sh
   <Directory /var/www/>
     Options Indexes FollowSymLinks
     AllowOverride All
     Require all granted
   </Directory>
   ````

8. Enable Apache Rewrite module

   $ sudo a2enmod rewrite

9. Enable Apache PHP module

   $ sudo a2enmod php7.4

10. Restart Apache service

    $ sudo systemctl restart apache2

11. Check the service

    ```shell
    $ netstat -an | grep LISTEN
    tcp        0      0 127.0.0.53:53           0.0.0.0:*               LISTEN     
    tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN     
    tcp        0      0 127.0.0.1:33060         0.0.0.0:*               LISTEN     
    tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN     
    tcp6       0      0 :::22                   :::*                    LISTEN     
    tcp6       0      0 :::80                   :::*                    LISTEN    
    ```

12. Configure Port forwarding (if using VirtualBox)

    ![port-forwarding-1](/Users/aryo/Nginx/kb/docs/images/port-forwarding-1.png)

    ![port-forwarding-2](/Users/aryo/Nginx/kb/docs/images/port-forwarding-2.png)

13. Go to Document Root directory, default: /var/www/html
    But now go up one level: /var/www

    ````shell
    $ ls -al
    total 12
    drwxr-xr-x  3 root root 4096 Oct 15 05:49 .
    drwxr-xr-x 14 root root 4096 Oct 15 05:49 ..
    drwxr-xr-x  2 root root 4096 Oct 15 06:24 html
    ````

    Change the owner of html directory to you.

    $ sudo chown -R aryo:aryo html

    ````shell
    $ ls -al
    total 12
    drwxr-xr-x  3 root root 4096 Oct 15 05:49 .
    drwxr-xr-x 14 root root 4096 Oct 15 05:49 ..
    drwxr-xr-x  2 aryo aryo 4096 Oct 15 06:24 html
    ````

14. Create a "Hello World" file on your computer

    ```php
    <?php echo "Hello World";
    ```

    and save as `hello.php`

15. Upload `hello.php` files to the server using FileZilla

    host: localhost
    your Ubuntu username and password 
    port: 2222

    ![fz](/Users/aryo/Nginx/kb/docs/images/fz.png)

    Upload the file to: /var/www/html

16. Open http://localhost:8000/hello.php

    ![hello](/Users/aryo/Nginx/kb/docs/images/hello.png)

17. Configuring MySQL Server

    By default, MySQL has user: root without password.
    But you have to connect using socket as root user of your server.

    Issuing this command will get you access denied error:

    ````shell
    $ mysql -u root
    ERROR 1698 (28000): Access denied for user 'root'@'localhost'
    aryo@ubuntu:/var/www/html$ 
    ````

    Instead, use this command:

    ```shell
    $ sudo mysql -u root
    [sudo] password for aryo: 
    Welcome to the MySQL monitor.  Commands end with ; or \g.
    Your MySQL connection id is 9
    Server version: 8.0.26-0ubuntu0.20.04.3 (Ubuntu)
    
    Copyright (c) 2000, 2021, Oracle and/or its affiliates.
    
    Oracle is a registered trademark of Oracle Corporation and/or its
    affiliates. Other names may be trademarks of their respective
    owners.
    
    Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
    
    mysql> 
    
    ```

18. Configuring MySQL to allow remote connection

    ```shell
    $ cd /etc/mysql/mysql.conf.d
    $ sudo vi mysqld.cnf
    ```

    Change

    ````shell
    bind-address      = 127.0.0.1
    ````

    to

    ````shell
    bind-address      = 0.0.0.0
    ````

    Restart MySQL Server

    ````shell
    $ sudo systemctl restart mysql
    ````

    

19. Configure the root user of MySQL to allow user to connect without sudo

    ```shell
    mysql> show databases;
    +--------------------+
    | Database           |
    +--------------------+
    | information_schema |
    | mysql              |
    | performance_schema |
    | sys                |
    +--------------------+
    4 rows in set (0.00 sec)
    
    mysql> use mysql;
    Reading table information for completion of table and column names
    You can turn off this feature to get a quicker startup with -A
    
    Database changed
    mysql> select user,host,authentication_string,plugin from user;
    +------------------+-----------+----------+-----------------------+
    | user             | host      | auth     | plugin                |
    +------------------+-----------+----------+-----------------------+
    | debian-sys-maint | localhost | $A$00... | caching_sha2_password |
    | mysql.infoschema | localhost | $A$00... | caching_sha2_password |
    | mysql.session    | localhost | $A$00... | caching_sha2_password |
    | mysql.sys        | localhost | $A$00... | caching_sha2_password |
    | root             | localhost |          | auth_socket           |
    +------------------+-----------+----------+-----------------------+
    5 rows in set (0.00 sec)
    
    mysql> update user set plugin = 'mysql_native_password' where user = 'root';
    Query OK, 1 row affected (0.00 sec)
    Rows matched: 1  Changed: 1  Warnings: 0
    
    mysql> flush privileges;
    Query OK, 0 rows affected (0.00 sec)
    
    mysql> select user,host,authentication_string,plugin from user;
    +------------------+-----------+----------+-----------------------+
    | user             | host      | auth     | plugin                |
    +------------------+-----------+----------+-----------------------+
    | debian-sys-maint | localhost | $A$00... | caching_sha2_password |
    | mysql.infoschema | localhost | $A$00... | caching_sha2_password |
    | mysql.session    | localhost | $A$00... | caching_sha2_password |
    | mysql.sys        | localhost | $A$00... | caching_sha2_password |
    | root             | localhost |          | mysql_native_password |
    +------------------+-----------+----------+-----------------------+
    5 rows in set (0.00 sec)
    
    mysql> quit;
    Bye
    
    $ mysql -u root
    Welcome to the MySQL monitor.  Commands end with ; or \g.
    Your MySQL connection id is 10
    Server version: 8.0.26-0ubuntu0.20.04.3 (Ubuntu)
    
    Copyright (c) 2000, 2021, Oracle and/or its affiliates.
    
    Oracle is a registered trademark of Oracle Corporation and/or its
    affiliates. Other names may be trademarks of their respective
    owners.
    
    Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
    
    mysql> 
    
    ```

     You can now login to MySQL with user root without sudo.

19. Configure port forwarding for MySQL

    ![port-forwarding-1](/Users/aryo/Nginx/kb/docs/images/port-forwarding-1.png)

    TODO: Screenshot of Port Forwarding Configuration of MySQL

    

20. Create MySQL user for both localhost and other computers:

    username: user

    password: pass

    ````shell
    mysql> create user 'user'@'%' identified by 'pass';
    Query OK, 0 rows affected (0.02 sec)
    
    mysql> create user 'user'@'localhost' identified by 'pass';
    Query OK, 0 rows affected (0.00 sec)
    
    mysql> grant all privileges on *.* to 'user'@'%';
    Query OK, 0 rows affected (0.00 sec)
    
    mysql> grant all privileges on *.* to 'user'@'localhost';
    Query OK, 0 rows affected (0.00 sec)
    
    mysql> flush privileges;
    Query OK, 0 rows affected (0.01 sec)
    
    mysql> 
    ````

    

