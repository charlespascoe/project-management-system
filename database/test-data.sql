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
