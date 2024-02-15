# Rest for Rec

A non-RESTful toy API for reserving seats at restaurants!

## Development Setup

### Requirements

1. The setup scripts assume you're running this on a UNIX-like system
2. SQLite
3. Node v20+

### Setup steps

1. Run `npm install` to install all dependencies
2. Run `npm run db:setup` to create and migrate the schema into the database locally
3. Run `npm run db:seed` to seed the database with the test data
4. Run the application with `npm run dev`
5. The integration tests can then be run with `npm test`

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

## If I Had More Time

Just a non-exhaustive roundup of some things I'd confront if I gave this more time:
