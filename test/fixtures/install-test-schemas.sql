DROP SCHEMA IF EXISTS springfield CASCADE;
DROP SCHEMA IF EXISTS government CASCADE;

CREATE SCHEMA springfield;

CREATE TABLE springfield.people (
  hash_sum text NOT NULL,
  social_security_id integer NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  age integer,
  CONSTRAINT springfield_people_pkey PRIMARY KEY (social_security_id)
);

INSERT INTO springfield.people (hash_sum, social_security_id, first_name, last_name, age) VALUES
('AAAAAAAA', 1, 'Homer', 'Simpson', 39),
('BBBBBBBB', 2, 'Marge', 'Simpson', 36),
('EEEEEEEE', 5, 'Montgomery', 'Burns', 123),
('11111111', 6, 'Ned', 'Flanders', 60);

CREATE SCHEMA worldof;

CREATE TABLE worldof.tomorrow (
  hash_sum text NOT NULL,
  space_id integer NOT NULL,
  name text NOT NULL,
  CONSTRAINT worldof_tomorrow_pkey PRIMARY KEY (space_id)
);

INSERT INTO worldof.tomorrow (hash_sum, space_id, name) VALUES
('ABCDEFGQ', 20, 'Philip J. Fry'),
('DEFGHIJK', 21, 'Leela'),
('GHIJKLMN', 22, 'Professor Farnsworth'),
('AAAAAAAA', 27, 'Bender'); -- clashing hash_sum with people table


CREATE SCHEMA government;

CREATE TABLE government.census (
  origin_hash_sum text,
  id_number integer NOT NULL,
  name text NOT NULL,
  town text,
  CONSTRAINT government_census_pkey PRIMARY KEY (id_number)
);

INSERT INTO government.census (origin_hash_sum, id_number, name, town) VALUES
('CCCCCCCC', 3, 'Arnie Pie', 'Springfield'),
('DDDDDDDD', 4, 'Seymor Skinner', 'Springfield'),
('EEEEEEEE', 5, 'Montgomery Burns', 'Springfield'),
('00000000', 6, 'Nedward Flanders', 'Springfield'),
('ABCDEFGH', 20, 'Phillip Fry', 'New New York'),
('DEFGHIJK', 21, 'Leela', 'New New York'),
('ZZZZZZZZ', 38, 'Doctor Zoidburg', 'New New York');
