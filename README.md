# Account Manager Module

Description
===========
This module provides data persistence in a relational database for user, profile and project data.

Dependencies
===========
This module has the following dependencies:

1. *MySQL*

2. *ETCD module*

3. *SQLite3* (for testing only)

Installation and Running
============
## Basic Install
```npm install```

```node .```

## With Service Discovery
You can easily use this module with service discovery if etcd (a service discovery)
is running in your local machine:

1. [Start etcd service](https://github.com/coreos/etcd/releases/)
2. Set ETCD_SERVER as an environment variable, with the url where etcd is
responding:
    * `export ETCD_SERVER=localhost:2379`
3. Clean any older record:
    * `curl http://localhost:2379/v2/keys/backends/accm?recursive=true -XDELETE`
4. Run `gulp serve`. It will listen at the port defined in `config` folder.

Tests and Dev
=============
```gulp test```

*Hint:* You don't need any database for testing this module, as it uses sqlite.

*Hint:* To run tests, you don't need to have the etcd server running

Interfaces
==========
All routes begin with the module's name (`/account-manager`).
You can find all the documentation on the docs (running the command ```gulp gendoc```) or
in the swagger file.

For a better visualization of the swagger.yaml files, you can use [Swagger
online editor](http://editor.swagger.io/#/).
