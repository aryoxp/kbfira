# CoreFramework: Introduction

The Kit-Build system is developed on top of CoreFramework. With the framework, the common implementation of long-and-confusing client-server Javascript-HTML-PHP codes becomes heavily reduced for easier reading and understanding. In addition to simplify the writing of PHP code, the framework further simplify the writing of client-server communication using Javascript and jQuery.

With the implementation of an MVC design pattern, the functionalities of an application can be shared across different applications for high modularity. It is expected to use another application functionalities without "reinventing the wheels" and write/duplicate the whole application source code for the same functionalities.

Developer who wish to develop a web application using this framework needs to understand the basic flow of a HTTP request being processed server-side using MVC design pattern.



## Background

Fast and simple development of a web application is the main reason why CoreFramework is made while keeping the goodness of MVC-style application development can be well managed for future improvement.



## Aim

The aim of the framework is to make the development of an multi-application and shared-functions of an MVC-style web application/system fast and easy. It provides several built-in library, including [MySQL](https://dev.mysql.com/) database connection provider and query builder to make database communication simple and easy. Thus, reduce the number of codes needed to make a modular web application or information system using PHP-MySQL.

It also provides (and uses) several libraries to make client-server communication and data transfer easy between client and server using Javascript, with the help of [jQuery](https://jquery.com/).



## How Does It Work?

Refer to the following diagram, CoreFramework applies the standard MVC design pattern of a web application into several main components. 

![mvc](/Users/aryo/Nginx/kb/docs/dev/app/images/mvc.png)

The CoreFramework adapts MVC design pattern in its implementations and divides the process of HTTP requests into several components:

![mvc-core](/Users/aryo/Nginx/kb/docs/dev/app/images/mvc-core.png)

A standard HTTP request for a web page or application interface (including Javascript) is made to a Controller. While HTTP requests from AJAX call of Javascript, which returns data in JSON format, is designed to be handled by CoreApi component, even though essentially CoreController can also behave as CoreApi. Put simply, request of a web interface and script is handled by CoreController, while subsequent data request (from Javascript AJAX call using JSON) is handled by CoreApi.

Application, which runs on top of CoreFramework, needs to inherit these components to run properly. At minimum, an application needs to have at least only one Controller to run. Later, a Controller could request data or service from a Service or Libraries. The framework provided a Core singleton object to share libraries and configuration settings across components.

![mvc-app](/Users/aryo/Nginx/kb/docs/dev/app/images/mvc-app.png)
