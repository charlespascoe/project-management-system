Project Management System
=========================

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
