# Account Manager Module

Description
===========
Deals with User data and user data persistance

Installation and Running
============
```npm install```
```gulp serve```

Tests and Dev
=============
```gulp nodemon```
```gulp test```
*Hint:* To run tests, you must have a etcd server running and also the mocks project

Interfaces
==========

## File
* create
* list
* delete
* apNode
* rmNode
* edNodeAtt

## Project
* create
* retrieve
* list

## PaaS
* deploy

Access Points
=============

* src/
 Source code.
* src/marked/
 Marked source code.
* gui/
 Graphical user interface.
* editor/
 Text editor.
* cli/
 Command line interface.
