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

AuthenticationToken (Extends Model)
-----------------------------------
* Knows
  * The access token hash and its expiry
  * The refresh token hash and its expiry
  * When this session's super-user priviledges expire
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
* Does
  * Saves an authentication token to the database
* Collaborators
  * Database
  * Schema

Permission (Extends Model)
--------------------------
* Knows
  * Permission Key (for reference throughout the server)
  * Description
* Collaborators
  * Database
  * Schema

Role (Extends Model)
--------------------
* Knows
  * Role Name
* Collaborators
  * Database
  * Schema

Assignment (Extends Model)
--------------------------
* Knows
  * The user
  * The project
  * The role the user has in that project
* Collaborators
  * Database
  * Schema

Project (Extends Model)
-----------------------
* Knows
  * Project Name
  * The project's tasks
  * The users assigned to the projet
* Does
  * Loads project tasks from the database
* Collaborators
  * Database
  * Schema
  * Task
  * Assignment

Database Classes
================

Transaction
-----------
* Knows
  * Transaction ID
* Does
  * Queries the database
  * Commits/rolls back the database

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
  * Gets a user by email or ID from database
  * Adds a user to the database
* Collaborators
  * Database
  * User
  * AuthenticationToken

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

Security Classes
================

PasswordHasher
--------------
* Does
  * Hashes passwords
  * Verifies passwords and password hashes

Authenticator
-------------
* Does
  * Authenticates user login requests
  * Authenticates refresh requests
  * Generates authentication token pairs
* Collaborators
  * User
  * PasswordHasher

Authorisor
----------
* Does
  * Verifies that a user has the correct permission for a particular action
* Collaborators
  * User
  * Role
  * Permission

Controller Classes
==================

AuthenticationController
------------------------
* Does
  * Handles requests to create a new authentication token pair
  * Handles requests to delete an authentication token pair
* Collaborators
  * User
  * AuthenticationTokenPair
  * Authenticator

UsersController
---------------
* Does
  * Handles requests to add a user
  * Handles requests to get all users
  * Handles requests to get a specific user's details
  * Handles requests to edit a user's details
  * Handles requests to delete a user
* Collaborators
  * Authorisor

ProjectsController
------------------
* Does
  * Handles requests to create a new project
  * Handles requests to get all projects
  * Handles requests to edit a project's details
* Collaborators
  * Authorisor

TasksController
---------------
* Does
  * Handles requests to create a new task to a project
  * Handles requests to get all tasks within a project
  * Handles requests to edit a task
* Collaborators
  * Authorisor

WorkLogController
-----------------
* Does
  * Handles requests to create a new log entry for a task
  * Handles requests to get all work log entries for a task
  * Handles deleting log entries

