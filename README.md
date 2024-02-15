# Rest for Rec

A non-RESTful toy API for reserving seats at restaurants!

## Development Setup

### Requirements

1. The setup scripts assume you're running this on a UNIX-like system,
   i.e. it uses `cat` during setup
2. SQLite
3. Node v20+

### Setup steps

1. Run `npm install` to install all dependencies
2. Run `npm run env:setup` to create a local `.env` file from the `.env.example`
3. Run `npm run db:setup` to create and migrate the schema into the database locally
4. Run `npm run db:seed` to seed the database with the test data

## Run the Integration Tests

The test suite assumes the Setup has been done above and the app is running:

1. Run the app with `npm run dev`
2. Run the integration tests with `npm test`

## Core Modeling

This section describes some core modeling assumptions; read on for the summary

### Restaurants

A restaurant has the following direct properties:

1. ID, numerical
2. Name, string

A restaurant:

1. Has many Tables
2. Has many Endorsements, via the table

### Restaurant Configs

This is a stretch model to mimick a restaurant configuring things;
in this case it's just a time zone

Every restaurant has one and only one Config.

### Restaurant Reservation Windows

This is a stretch model to mimick a restaurant configuring "open windows" for reservations

Every restaurant, for the purposes of this example, has a reservation window
from 4:00pm to 9:00pm UTC-8

The system won't yield reservations and won't allow creating a reservation
outside of these reservation windows

### Tables

A table has the following direct properties:

1. ID, numerical
2. Restaurant ID, numerical - the restaurant this table belongs to
3. Capacity, numerical, i.e. if it's a two-, four- or six-top
4. Minimum, numerical:
   a. This is a purely experimental property mimicking a restaurant
   that says "I don't want to book a party of 2 on a six-top"

Each table belongs to a restaurant.

### Reservations

A reservation has the following direct properties:

1. ID, numerical
2. Table ID, numerical - the table this reservation is for
3. Start, string - the start date of the reservation as an ISO8601 string
4. End, string - the end date of the reservation as an ISO8601 string

A reservation:

1. Belongs to a table directly
2. Has many Diners

### Diners

A diner has the following direct properties:

1. ID, numerical
2. Name, string

A diner:

1. Has many Reservations
2. Has many Endorsements

### Endorsements

An endorsement has the following direct properties:

1. ID, numerical
2. Tag, string, unique

An endorsement:

1. Has (and belongs to) many Diners
2. Has (and belongs to) many Restaurants

## Why a Query Builder and Not an ORM?

Primarily because I wanted to get this up and running quickly, and researching an
ORM takes time. Prisma, for example, has major performance concerns I'd want
to weigh out before introducing.

## Why No Joins?

Joins can be slow. As an architectural assumption, I'm assuming this app is
co-located with its database. In many cases, repeated queries to a
SQLite DB can be way faster than a Join. That kind of call would take measuring
some queries depending on how this thing is being used

## Some of These Queries Suck

There's a handful of these queries I'd want to optimize as a fast-follow, but
given the time constraint for this interview I wanted to cover the broader
assignment instead of nit-picking a few nested loops here and there. I opted
for the naive approach in a few cases.

In a production scenario, I'd run some benchmarks and figure out what the hot queries
are before optimizing those.

## Why Integration Tests?

I prefer them for this style of small application since it gives me the most
confidence that it's behaving appropriately. Plus, it has the bonus of letting
the core implementation change at this "early" stage without requiring rewriting
a bunch of tests.

## Will This Scale?

Kind of!

Some core assumptions and thoughts:

1. Since you can assume that people are searching in their area,
   you can partition and co-locate this kind of app with its user
   a. For example, something like Turso lets you do SQLite (libSQL)
   at the edge.
2. Something like ElasticSearch (now OpenSearch) would allow searching for
   restaurant IDs via geo-hashing against either the diner's location or by
   grabbing coordinates from the location API on a phone or from the browser,
   for instance. Then, you would limit the restaurant IDs to a list of IDs within
   a specified distance, cutting down on the query size.
3. Depending on the tradeoffs there you could opt for a distributed database like
   Planetscale (Vitess-flavored MySQL), that supports multiple read replicas.
   Or, again, something like Turso for data on the edge (though edge is probably
   over-optimizing)

## If I Had More Time

Just a non-exhaustive roundup of some things I'd confront if I gave this more time:

- Get CI working via Github Actions
- Develop a layer for error handling
- Add some logs, metrics, eventing and error tracking
- Optimize some of the underlying queries (see Query Optimization)
- Add a bunch more unit tests (see Testing)
- Flesh out the input handling to allow for different inputs, for example,
  a range of hours, days, or years
- Input validation on the date values themselves - currently you can reserve
  tables in the past
- Add some smarter config values, for example, letting restaurants set overrides
  against their reservation windows
- Add some input options to control how strict the endorsement search is,
  for example, letting a diner have their endorsement be a "preference"
  rather than a requirement
- Dockerize it
