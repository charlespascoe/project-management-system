Class Responsibility Collaborator Design
========================================

This is a high-level design of the classes that will be used by the server.

If a class extends another class, it will extend that class in the code, and as a result, inherit the responsibility of the class it extends from.

Models
======

Schema
------
* Knows
* Does

Model
-----
* Knows
* Does
* Collaborators
  * Schema

User (Extends Model)
--------------------
* Knows
  * Email
  * Names
  * Password Hash
* Does
  *
* Collaborators
  * Model
  * Schema

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
* Collaborators
  * PasswordHasher

