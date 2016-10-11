Class Responsibility Collaborator Design
========================================

This is a high-level design of the classes that will be used by the client.

If a class extends another class, it will extend that class in the code, and as a result, inherit the responsibility of the class it extends from.

Status Classes
--------------
There are a special set of Status classes, extending from a base `Status` class, that will be used to represent various response statuses.

If a class collaborates with the `Status` class, it means that it will be using any of the subclasses of `Status`. *(Needs further explanation)*

RestResponse
------------
* Knows
  * The status code of the response
  * The parsed JSON object of the response

RestClient
----------
* Knows
  * The base URL for all requests
  * Headers to attach to all requests
* Does
  * Make requests to different URLs
  * Serialise/Deserialise data (just JSON, for now)
* Collaborators
  RestResponse

AuthenticationApi
-----------------
* Knows
  * The base URL for all authentication requests
* Does
  * Handle login requests
  * Handle token refresh requests
* Collaborators
  * RestClient
  * RestResponse
  * Status

OAuthClient
-----------
* Knows
  * OAuth tokens
* Does
  * Saves/loads OAuth tokens to storage
  * Appends authorisation headers to all requests made through it
  * Automatically refreshes tokens when the access token expires, and retries the request
* Collaborators
  * RestClient
  * RestResponse
  * RestResponse
  * Response
  * Status
  * AuthenticationApi

UserApi
-------
* Knows
  * The base URL for all requests
* Does
  * Handles requests to get user information (names, email, etc.)
  * Handles requests to change user information (except sysadmin status)
* Collaborators
  * RestResponse
  * Response
  * Status
  * OAuthClient

UserManagementApi
-----------------
* Knows
  * The base URL for all requests
* Does
  * Handles requests to create a user
  * Handles requests to deactivate a user
  * Handles requests to trigger a password reset for a user (not the current user)
  * Handles requests to change user details, including sysadmin status
* Collaborators
  * RestResponse
  * Response
  * Status
  * OAuthClient

ProjectApi
----------
* Knows
  * The base URL for all requests
* Does
  * Handles requests to get all projects the user can see
  * Handles requests to get all tasks in a project
* Collaborators
  * RestResponse
  * Response
  * Status
  * OAuthClient

ProjectManagementApi
--------------------
* Knows
  * The base URL for all requests
* Does
  * Handles requests to create a project
  * Handles requests to delete a project
  * Handles requests to
* Collaborators
  * RestResponse
  * Response
  * Status
  * OAuthClient

