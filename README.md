Project Management System
=========================

A Node.js server for managing a number of projects in a team, with access control features and a consistent REST API.

This is part of a Uni assignment, and while it currently doesn't implement all of the desired functionality, it does demonstrate a working, scalable (in terms of adding new features without significant modification of existing code, and horizontally scalable using load balancers) Node.js service.

[Project Management System Client](https://github.com/cpascoe95/project-management-system-client) is a React.js application for this service.

The requirements and design documents are in the `design` folder, which explain the purpose of the application and the motivation behind certain design choices.

Development Setup
-----------------

`$ make init`

Running in development mode
---------------------------

`$ npm start`

Building Docker Image
---------------------

Make `latest` image:

`$ make docker`

Version:

`$ make docker VERSION=1.2.3`

Version with a different tag:

`$make docker VERSION=1.2.3 TAG=something-else`

Exporting Docker Image
----------------------

Export `proj-mgmt-sys:latest`:

`$ make export-docker`

Export specific tag:

`$ make export-docker TAG=1.2.3`
