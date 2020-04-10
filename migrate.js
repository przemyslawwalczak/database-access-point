// migrate checkout
// migrate sync

// -checkout
/**
 * Create temporary database
 * Sync the database with the files we already do have for database B
 * Find and produce differences to a migration file from database A
 * Migration files should produce the same database A and B
 */

// -sync
/**
 * Find current version of a database A
 * Run migration from current version to latest version
 * Update the current version of database
 */

require('./module/literal-require')

const migration = require('pg-compare')
const pg = require('pg')

let command = process.argv[1]

console.log(command)

// console.log(migration.Compare)