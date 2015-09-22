CREATE TABLE access_level (
	id integer NOT NULL,
	name varchar(200) NOT NULL,
	description text,
	created_at varchar(50) NOT NULL,
	updated_at varchar(50) NOT NULL,
	PRIMARY KEY (id)
);
CREATE TABLE account_type (
	id integer NOT NULL,
	name varchar(200) NOT NULL,
	description text,
	created_at varchar(50) NOT NULL,
	updated_at varchar(50) NOT NULL,
	PRIMARY KEY (id)
);
CREATE TABLE profile (
	id integer NOT NULL,
	code varchar(40) UNIQUE,
	first_name varchar(200),
	last_name varchar(255),
	created_at varchar(50) NOT NULL,
	updated_at varchar(50) NOT NULL,
	account_id integer,
	PRIMARY KEY (id),
	FOREIGN KEY (account_id) REFERENCES account_type (id)
);
CREATE TABLE profile_user (
	id integer NOT NULL,
	created_at varchar(50) NOT NULL,
	updated_at varchar(50) NOT NULL,
	profile_id integer,
	user_id integer,
	PRIMARY KEY (id),
	FOREIGN KEY (user_id) REFERENCES user (id),
	FOREIGN KEY (profile_id) REFERENCES profile (id)
);
CREATE TABLE project (
	id integer NOT NULL,
	name varchar(255),
	safe_name varchar(80),
	code varchar(40) UNIQUE,
	description text,
	created_at varchar(50) NOT NULL,
	updated_at varchar(50) NOT NULL,
	owner integer,
	PRIMARY KEY (id),
	FOREIGN KEY (owner) REFERENCES profile (id),
	UNIQUE(safe_name, owner)
);
CREATE TABLE project_access (
	id integer NOT NULL,
	created_at varchar(50) NOT NULL,
	updated_at varchar(50) NOT NULL,
	profile_id integer,
	project_id integer,
	access_type integer,
	PRIMARY KEY (id),
	FOREIGN KEY (access_type) REFERENCES access_level (id),
	FOREIGN KEY (project_id) REFERENCES project (id),
	FOREIGN KEY (profile_id) REFERENCES profile (id)
);

CREATE TABLE user (
	id integer NOT NULL,
	active integer NOT NULL,
	last_login varchar(50) NOT NULL,
	email varchar(200) NOT NULL UNIQUE,
	password varchar(60) NOT NULL,
	created_at varchar(50) NOT NULL,
	updated_at varchar(50) NOT NULL,
	PRIMARY KEY (id)
);

INSERT INTO access_level(id, name, description, created_at, updated_at) VALUES (1, 'write', 'Has write access', '2015-09-22 11:03:01', '2015-09-22 11:03:01');
INSERT INTO access_level(id, name, description, created_at, updated_at) VALUES (2, 'read', 'Has write access', '2015-09-22 11:03:01', '2015-09-22 11:03:01');

INSERT INTO user(id, active, last_login, email, password, created_at, updated_at) VALUES(1, 0, '2015-09-22 11:03:01', 'john.connor@resistance.com', 'secret', '2015-09-22 11:03:01', '2015-09-22 11:03:01');
INSERT INTO user(id, active, last_login, email, password, created_at, updated_at) VALUES(2, 0, '2015-09-22 11:03:01', 'terminator@skynet.com', 'terminate', '2015-09-22 11:03:01', '2015-09-22 11:03:01');
INSERT INTO user(id, active, last_login, email, password, created_at, updated_at) VALUES(3, 0, '2015-09-22 11:03:01', 'sarah.connor@resistance.com', 'hope2014', '2015-09-22 11:03:01', '2015-09-22 11:03:01');

INSERT INTO profile(id, code, first_name, last_name, created_at, updated_at, account_id) VALUES (1, 'code12345', 'John Connor', 'Connor', '2015-09-22 11:03:01', '2015-09-22 11:03:01', 1);
INSERT INTO profile(id, code, first_name, last_name, created_at, updated_at, account_id) VALUES (2, 'code34567', 'Terminator Genesis', 'Genesis', '2015-09-22 11:03:01', '2015-09-22 11:03:01', 1);
INSERT INTO profile(id, code, first_name, last_name, created_at, updated_at, account_id) VALUES (3, 'code23456', 'Sarah Connor', 'Connor', '2015-09-22 11:03:01', '2015-09-22 11:03:01', 1);

INSERT INTO profile_user(id, created_at, updated_at, profile_id, user_id) VALUES (1, '2015-09-22 11:03:01', '2015-09-22 11:03:01', 1, 1);
INSERT INTO profile_user(id, created_at, updated_at, profile_id, user_id) VALUES (2, '2015-09-22 11:03:01', '2015-09-22 11:03:01', 2, 2);
INSERT INTO profile_user(id, created_at, updated_at, profile_id, user_id) VALUES (3, '2015-09-22 11:03:01', '2015-09-22 11:03:01', 3, 3);

INSERT INTO project(id, name, safe_name, code, description, created_at, updated_at, owner) VALUES (1, 'Save the World', 'save-the-world', 'code2222', 'How to fight SkyNet', '2015-09-22 11:03:01', '2015-09-22 11:03:01', 1);
INSERT INTO project(id, name, safe_name, code, description, created_at, updated_at, owner) VALUES (2, 'Fight robots', 'fight-robots', 'code333', 'Robots weak spots', '2015-09-22 11:03:01', '2015-09-22 11:03:01', 1);
INSERT INTO project(id, name, safe_name, code, description, created_at, updated_at, owner) VALUES (3, 'Message of Hope', 'message-of-hope', 'code444', 'A message to all humans', '2015-09-22 11:03:01', '2015-09-22 11:03:01', 1);

INSERT INTO project(id, name, safe_name, code, description, created_at, updated_at, owner) VALUES (4, 'To my son', 'to-my-son', 'code555', 'A guide for your success', '2015-09-22 11:03:01', '2015-09-22 11:03:01', 3);
INSERT INTO project(id, name, safe_name, code, description, created_at, updated_at, owner) VALUES (5, 'Judgment Day', 'judgment-day', 'code666', 'The day of the Judgment', '2015-09-22 11:03:01', '2015-09-22 11:03:01', 3);


INSERT INTO project(id, name, safe_name, code, description, created_at, updated_at, owner) VALUES (6, 'I will be back', 'i-will-be-back', 'code7777', 'I will survive, You will not', '2015-09-22 11:03:01', '2015-09-22 11:03:01', 2);
INSERT INTO project(id, name, safe_name, code, description, created_at, updated_at, owner) VALUES (7, 'Hasta la vista, baby', 'hasta-la-vista-baby', 'code888', 'Bye, bye', '2015-09-22 11:03:01', '2015-09-22 11:03:01', 2);

INSERT INTO project_access(id, created_at, updated_at, profile_id, project_id, access_type) VALUES (1, '2015-09-22 11:03:01', '2015-09-22 11:03:01', 1, 1, 1);
INSERT INTO project_access(id, created_at, updated_at, profile_id, project_id, access_type) VALUES (2, '2015-09-22 11:03:01', '2015-09-22 11:03:01', 1, 2, 1);
INSERT INTO project_access(id, created_at, updated_at, profile_id, project_id, access_type) VALUES (3, '2015-09-22 11:03:01', '2015-09-22 11:03:01', 1, 3, 1);
INSERT INTO project_access(id, created_at, updated_at, profile_id, project_id, access_type) VALUES (4, '2015-09-22 11:03:01', '2015-09-22 11:03:01', 1, 4, 2);
INSERT INTO project_access(id, created_at, updated_at, profile_id, project_id, access_type) VALUES (5, '2015-09-22 11:03:01', '2015-09-22 11:03:01', 1, 5, 1);
INSERT INTO project_access(id, created_at, updated_at, profile_id, project_id, access_type) VALUES (6, '2015-09-22 11:03:01', '2015-09-22 11:03:01', 2, 6, 1);
INSERT INTO project_access(id, created_at, updated_at, profile_id, project_id, access_type) VALUES (7, '2015-09-22 11:03:01', '2015-09-22 11:03:01', 2, 7, 1);
INSERT INTO project_access(id, created_at, updated_at, profile_id, project_id, access_type) VALUES (8, '2015-09-22 11:03:01', '2015-09-22 11:03:01', 3, 4, 1);
INSERT INTO project_access(id, created_at, updated_at, profile_id, project_id, access_type) VALUES (9, '2015-09-22 11:03:01', '2015-09-22 11:03:01', 3, 5, 1);
INSERT INTO project_access(id, created_at, updated_at, profile_id, project_id, access_type) VALUES (10, '2015-09-22 11:03:01', '2015-09-22 11:03:01', 3, 6, 2);
INSERT INTO project_access(id, created_at, updated_at, profile_id, project_id, access_type) VALUES (11, '2015-09-22 11:03:01', '2015-09-22 11:03:01', 3, 7, 2);