Class Responsibility Collaborator Design
========================================

This is a high-level design of the classes that will be used by the server.

If a class extends another class, it will extend that class in the code, and as a result, inherit the responsibility of the class it extends from.

Models
======

Models will be implemented in an Active Record style. Model will be the base class, and will save changes made to the entity (the entity being an instance of a class that extends Model, e.g. an instance of a the User class).

Schema
------
* Knows
  * The properties of an entity and the columns that they map to
* Does
  * Map properties onto columns

Model
-----
* Knows
  * The schema for this entity
* Does
  * Saves entity changes to the database
  * Deletes this entity from the database
* Collaborators
  * Database
  * Schema

AuthenticationTokenPair (Extends Model)
-----------------------------------
* Knows
  * The access token hash and its expiry
  * The refresh token hash and its expiry
  * When this session's system administrator priviledges expire
  * Formats the data to be sent to the client
* Collaborators
  * Database
  * Schema

User (Extends Model)
--------------------
* Knows
  * Email
  * Names
  * Password Hash
  * User's authentication tokens
  * Whether or not the user is a System Administrator
  * The projects the user is assigned to
* Does
  * Saves an authentication token to the database
  * Deactive the user
  * Formats the data to be sent to the client
* Collaborators
  * AuthenticationToken
  * Database
  * Schema

Role (Extends Model)
--------------------
* Knows
  * Role Name
  * Permissions (application-defined string constants) that this role has
* Does
  * Formats the data to be sent to the client
* Collaborators
  * Database
  * Schema

ProjectAssignment (Extends Model)
--------------------------
* Knows
  * The user
  * The project
  * The role the user has in that project
* Does
  * Formats the data to be sent to the client
* Collaborators
  * User
  * Project
  * Role
  * Database
  * Schema

Project (Extends Model)
-----------------------
* Knows
  * Project ID
  * Project Name
  * Project Icon URL
* Does
  * Adds a task to the project
  * Loads project tasks from the database
  * Add a user as a project member
  * Loads assigned project members from the database
  * Removes a project member
  * Formats the data to be sent to the client
* Collaborators
  * Database
  * Schema
  * Task
  * Assignment

Task (Extends Model)
--------------------
* Knows
  * The project this task belongs to
  * Task ID
  * Summary
  * Description
  * Estimated Effort
  * Created timestamp
  * Target Completion Date
  * State
  * Completed Timestamp
  * The assigned user
* Does
  * Gets the work log associated with the task
  * Formats the data to be sent to the client
* Collaborators
  * Database
  * Schema
  * Project
  * WorkLogEntry

WorkLogEntry (Extend Model)
---------------------------
* Knows
  * The task this work log belongs to
  * Log ID
  * The user that created the log
  * Log description
  * Log effort
  * Log timestamp
* Does
  * Formats the data to be sent to the client
* Collaborators
  * Database
  * Schema
  * Task
  * User


Database Classes
================

Transaction
-----------
* Knows
  * Transaction ID
* Does
  * Queries the database
  * Commits/rolls back the changes made to the database

Database
--------
* Knows
  * The next transaction ID
* Does
  * Queries the database
  * Initiates a transaction
* Collaborators
  * Transaction

Users
-----
* Does
  * Gets all users from the database
  * Gets a user by email or ID from database
  * Adds a user to the database
* Collaborators
  * Database
  * User

AuthenticationTokens
--------------------
* Does
  * Adds an authentication token pair to the database
* Collaborators
  * Database
  * AuthenticationTokenPair

Projects
--------
* Does
  * Gets all projects in the database
  * Adds a projects to the database
* Collaborators
  * Database
  * Project

Roles
-----
* Does
  * Gets a role by ID
  * Gets all roles
* Collaborators
  * Database
  * Role

Security Classes
================

PasswordHasher
--------------
* Knows
  * The current parameters to use when hashing new passwords
* Does
  * Hashes passwords
  * Verifies passwords and password hashes
  * Updates password hash if it uses old parameters

Authenticator
-------------
* Does
  * Authenticates user login requests
  * Authenticates refresh requests
  * Generates authentication token pairs
  * Elevates a system administrator's login session
  * Generates password reset tokens
  * Hashes new passwords
* Collaborators
  * Users
  * User
  * PasswordHasher

Authorisor
----------
* Does
  * Verifies that a user is correctly elevated for a system administrator action
  * Verifies that a user has the correct permission for a given project
* Collaborators
  * User
  * ProjectAssignment
  * Role

Controller Classes
==================

AuthenticationController
------------------------
* Does
  * Handles requests to create a new authentication token pair
  * Handles requests to delete an authentication token pair
  * Handles requests to elevate a login session
  * Handles requests to drop system administrator elevation
  * Handles requests to change the user's password
* Collaborators
  * User
  * AuthenticationTokenPair
  * Authenticator
  * EmailDistributor
  * EmailTemplator

UsersController
---------------
* Does
  * Handles requests to add a user
  * Handles requests to get all users
  * Handles requests to get a specific user's details
  * Handles requests to get a user's assignments
  * Handles requests to edit a user's details
  * Handles requests to delete a user
* Collaborators
  * Authorisor
  * Users
  * User
  * Authenticator
  * ProjectAssignment
  * EmailDistributor
  * EmailTemplator

ProjectsController
------------------
* Does
  * Handles requests to get all projects
  * Handles requests to create a new project
  * Handles requests to edit a project's details
* Collaborators
  * Authorisor

MembersController
-----------------
* Does
  * Handles requests to get all project members
  * Handles requests to get project non-members
  * Handles requests to add a user to a project
  * Handles requests to update a member's role in a project
  * Handles requests to remove a member from a project
* Collaborators
  * Projects
  * Project
  * User
  * Roles
  * Role
  * Authorisor

TasksController
---------------
* Does
  * Handles requests to get all tasks within a project
  * Handles requests to create a new task in a project
  * Handles requests to get a task's details (description etc.)
  * Handles requests to edit a task
* Collaborators
  * Project
  * Task
  * Authorisor

WorkLogController
-----------------
* Does
  * Handles requests to create a new log entry for a task
  * Handles requests to get all work log entries for a task
  * Handles deleting log entries
* Collaborators
  * Authorisor
  * User
  * ProjectAssignment
  * Task
  * WorkLogEntry

RolesController
---------------
* Does
  * Handles requests to get all roles
* Collaborators
  * Roles
  * Role

Miscellaneous
=============

EmailDistributor
----------------
* Knows
  * Email distribution server configuration
* Does
  * Sends a HTML email to a given email address

EmailTemplator
--------------
* Does
  * Generates the HTML for a password reset email, with the given user's name and password reset token
  * Generates the HTML for a welcome email, with the given user's name and password reset token

