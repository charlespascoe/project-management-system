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

User (Extends Model)
----
* Knows
  * Email
  * Names
  * Password Hash
* Does
  *

