DROP SCHEMA IF EXISTS feed CASCADE;
DROP SCHEMA IF EXISTS registry CASCADE;

CREATE SCHEMA feed;

CREATE TABLE feed.addresses (
  hash_sum text NOT NULL,
  ref integer NOT NULL,
  counter integer NOT NULL DEFAULT 1,
  label text NOT NULL,
  CONSTRAINT feed_addresses_pkey PRIMARY KEY (ref, counter)
);

INSERT INTO feed.addresses (hash_sum, ref, label) VALUES
('AAAA', 1, '1 High Street'),
('BBBB', 2, '2 High Street');

CREATE SCHEMA registry;

CREATE TABLE registry.addresses (
  origin_hash_sum text,
  ref integer NOT NULL,
  counter integer NOT NULL,
  label text NOT NULL,
  data_source text,
  removed_at timestamp with time zone,
  CONSTRAINT registry_addresses_pkey PRIMARY KEY (ref, counter)
);

INSERT INTO registry.addresses (origin_hash_sum, ref, counter, label, data_source, removed_at) VALUES
('AAAA', 1, 1, '1 High Street', 'feed', null),
('BBBB', 2, 1, '2 High Street', 'feed', null),
('CCCC', 3, 1, '3 High Street', 'feed', null),
(null, 4, 1, '4 High Street (added locally)', 'local', null);
