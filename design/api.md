Indentation implies concatentation of path, e.g. auth -> GET /auth-token means maiking a GET request to {host}/auth/auth-token

* auth
  * GET /auth-token
    * Given some means of authentication (either username/password or refresh token) via the 'Authorization' header, it will return a new authentication token pair (access/refresh token) and a unique ID for the pair
  * DELETE /auth-token/{token pair ID}
    * Requires a valid access token when making the request
    * Invalidates an authentication token pair (e.g. on logout)

All other requests require a valid access token to succeed

* project
  * GET /
    * Returns a list of all projects
  * POST /
    * Creates a new project
    * The request body must contain all of the data needed to create the project
  * GET /{project ID}
    * Returns detailed information about a project
  * PUT /{project ID}
    * Updates certain information about the project (e.g. project name)
  * GET /{project ID}/members
    * Returns a list of all members in a project
  * POST /{project ID}/members
    * Adds a member to the project
    * The body must include the user ID and the role ID of the role the user has in the project
    * If the user exists in the project, their role will be updated
  * DELETE /{project ID}/members/{user ID}
    * Removes a member from the project
  * /{project ID}/task
    * GET /
      * Returns a list of all tasks in the project
      * Includes basic information such as summary and time estimate
    * POST /
      * Creates a new task in the project
      * Must include all the information necessary to create a new task
    * GET /{task ID}
      * Returns detailed information about a task, such as description
    * PUT /{task ID}
      * Updates certain attributes of the task, including state changes
    * GET /{task ID}/worklog
      * Gets list of work log entries
    * POST /{task ID}/worklog
      * Adds a new work log entry
    * DELETE /{task ID}/worklog/{work log ID}
      * Deletes a work log entry


