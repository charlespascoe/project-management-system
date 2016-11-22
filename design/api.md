Authorisation and Permissions
=============================
Each route will have different levels of authorisation defined as permissions. This will include a description of the class of user (e.g. Sysadmin, or a project member), or it may be a permission key (e.g. `MANAGE_MEMBERS`) which is associated with the role that the user has in that particular project.

Routes
======

* /auth/auth-token
    * GET - Given some means of authentication (either username/password or refresh token) via the 'Authorization' header, it will return a new authentication token pair (access/refresh token) and a unique ID for the pair
* /auth/auth-token/{Optional Token Pair ID}
  * DELETE - Invalidates the specified authentication token pair (e.g. on logout)
    * If no ID is provided, the token used to make the request will be deleted
    * Requires a valid access token when making the request

All other requests require a valid access token to succeed

* /users
  * GET - Returns a list of all users
    * Permission: Sysadmin
  * POST - Adds a new user
    * Permission: Sysadmin
* /users/{User ID}
  * GET - Gets detailed info on a specific user
    * Permission: The user or a Sysadmin
  * PUT - Updates the user's information
    * Permission: The user or a Sysadmin
  * DELETE - Deactivates the user
    * Permission: Sysadmin (can't deactivate themselves)
* /users/{User ID}/assignments
  * GET - Gets a list of all projects the user is assigned to
    * Permission: The user or a Sysadmin
* /projects
  * GET - Returns a list of all projects
    * Permission: Sysadmin
  * POST - Creates a new project
    * Permission: Sysadmin
    * The request body must contain all of the data needed to create the project
* /projects/{Project ID}
  * GET - Returns detailed information about a project
    * Permission: Project Member or Sysadmin
  * PUT - Updates certain information about the project (e.g. project name)
    * Permission: `UPDATE_PROJECT_DETAILS` or Sysadmin
  * DELETE - Marks the project as complete (archives the project)
    * Permission: `MARK_PROJECT_COMPLETE` or Sysadmin
* /projects/{Project ID}/members
  * GET - Returns a list of all members in a project and their roles
    * Permission: Project Member or Sysadmin
  * POST - Adds a member to the project
    * Permission: `MANAGE_MEMBERS` or Sysadmin
    * The body must include the user ID and the role ID of the role the user has in the project
* /projects/{Project ID}/members/{user ID}
  * GET - Gets the role and permissions a user has in a project
    * Permission: `MANAGE_MEMBERS`, the user, or a Sysadmin
  * PUT - Updates the role a user has in a project
    * Permission: `MANAGE_MEMBERS` or Sysadmin
  * DELETE - Removes a member from the project
    * Permission: `MANAGE_MEMBERS` or Sysadmin
* /projects/{Project ID}/tasks
  * GET - Returns a list of all tasks in the project
    * Permission: Project Member
    * Includes basic information such as summary and time estimate
  * POST - Creates a new task in the project
    * Permission: `CREATE_TASK`
    * Must include all the information necessary to create a new task
* /projects/{Project ID}/tasks/{Task ID}
  * GET - Returns detailed information about a task, such as description
    * Permission: Project Member
  * PUT - Updates certain attributes of the task, including state changes
    * Permissions:
      * Any user with `EDIT_TASK` for editing the fields
      * The assigned user with `CHANGE_ASSIGNED_TASK_STATE` to change the state (e.g. to mark as completed)
      * Any user with `CHANGE_ANY_TASK_STATE` to change the state
* /projects/{Project ID}/tasks/{Task ID}/worklog
  * GET - Gets list of work log entries
    * Permission: Project Member
  * POST - Adds a new work log entry
    * Permission: Must be the assigned user, and have the `LOG_WORK` permission
* /projects/{Project ID}/tasks/{Task ID}/worklog/{Work Log ID}
  * DELETE - Deletes a work log entry
    * Permission:
      * The assigned user with the `DELETE_WORK_LOG` permission
      * Any user with the `DELETE_ANY_WORK_LOG` permission

