import logging

from azure.cosmos.cosmos_client import CosmosClient
from azure.cosmos.errors import HTTPFailure

from config import Mongo

log = logging.getLogger(__name__)

def configure_database_with_shared_throughput(db_name, master_key, url_connection):
  client = CosmosClient(url_connection=url_connection, auth={"masterKey": master_key})
  db = configure_db(client, db_name, {"offerThroughput": Mongo.throughput})
  set_db_throughput(client, db['_self'], Mongo.throughput)

def configure_db(client, name, options=None):
  try:
    return client.CreateDatabase({"id": name}, options)
  except HTTPFailure as e:
    if e.status_code != 409:
      raise e
  return client.ReadDatabase(f"dbs/{name}")

def set_db_throughput(client, db_self, desired_throughput):
  offer = list(client.QueryOffers(f"SELECT * FROM c WHERE c.resource = '{db_self}'"))[0]
  current_throughput = offer["content"]["offerThroughput"]
  if current_throughput == desired_throughput:
    log.info("Shared database throughput up to date")
  else:
    log.info(f"Updating shared database throughput from {current_throughput} to {desired_throughput}")
    offer["content"]["offerThroughput"] = desired_throughput
    offer = client.ReplaceOffer(offer["_self"], offer)

def configure_collections(db_name, collection_names, master_key, url_connection):
  client = CosmosClient(url_connection=url_connection, auth={"masterKey": master_key})
  db = configure_db(client, db_name)

  for collection_name in collection_names:
    configure_collection(client, db, collection_name)


def configure_collection(client, db, collection_name):
  try:
    collection = client.CreateContainer(db["_self"], {
      "id": collection_name,
      "partitionKey": {
        "paths": ["/_id"],
      }
    })
    log.info(f"Created collection {collection_name}")
    return collection
  except HTTPFailure as e:
    if e.status_code != 409:
      raise e

  log.info(f"Collection {collection_name} already exists")
  collections = list(client.ReadContainers(db["_self"]))
  collection = [c for c in collections if c["id"] == collection_name][0]
  return collection

def delete_db(db_name, master_key, url_connection):
  client = CosmosClient(url_connection=url_connection, auth={"masterKey": master_key})
  db = head_opt(client.QueryDatabases(f"SELECT * FROM root r WHERE r.id='{db_name}'"))
  if db:
    log.info(f"Deleting database '{db_name}'")
    client.DeleteDatabase(db["_self"])
  else:
    log.info(f"Databse '{db_name}' does not exist")

def head_opt(items):
  return next(iter(items), None)
