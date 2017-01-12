INSERT INTO `user` SET
    `email` = 'bob@mail.com',
    `first_name` = 'Bob',
    `other_names` = 'Smith',
    `pass_hash` = '$argon2i$v=19$m=4096,t=3,p=1$q83vASNFZ4k$V7yt2zgip4VEyPZvAU02EerNEt5mbOFwEKiyxTHVkG0',
    `sysadmin` = TRUE;

INSERT INTO `project` SET
    `project_id` = 'EXAMPLE',
    `project_name` = 'Example Project',
    `icon_url` = 'https://www.example.com/icon.png';

INSERT INTO `task` SET
    `project_id` = 'EXAMPLE',
    `task_id` = 1,
    `task_summary` = 'Task Summary',
    `task_desc` = 'Task Description',
    `priority` = 2,
    `est_effort` = 60,
    `assigned_user_id` = 1;

INSERT INTO `project_assignment` SET
    `project_id` = 'EXAMPLE',
    `user_id` = 1,
    `role_id` = 3;

INSERT INTO `authentication_token_pair` SET
    `user_id` = 1,
    `access_token_hash` = '8d70d691c822d55638b6e7fd54cd94170c87d19eb1f628b757506ede5688d297',
    `refresh_token_hash` = 'aafa373bf008a855815ecb37d8bd52f6a8157cb5833c58edde6d530dbcf3f25d';
