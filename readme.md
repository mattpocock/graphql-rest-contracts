# Getting Started

Run `npm i graphql-rest-mocks`

Create a folder called `./contracts` in your repository

Add a file called `HelloWorld.graphql`, with these contents:

```graphql
type Request {
  id: ID!
}

type Response {
  string: String!
}
```

Add this script to your package.json:

```json
{
  "scripts": {
    "start": "graphql-rest-mocks start ./contracts"
  }
}
```

Run `npm run start`

Visit `localhost:4000/HelloWorld?id=200`

You'll see a mock server producing data.

## Add global types

Create a folder called `./types`

Add a file called `GlobalType.graphql`, with these contents:

```graphql
type GlobalType {
  someGlobalId: ID!
}
```

Change `HelloWorld.graphql` to use that global type, as below:

```graphql
type Request {
  id: ID!
}

type Response {
  string: String!
  globalType: GlobalType!
}
```

No need to import it, or do anything fancy. Any type, scalar or enum declared in the global types folder is available to all contracts.

Change the script to use the types folder:

```json
{
  "scripts": {
    "start": "graphql-rest-mocks start ./contracts --types ./types"
  }
}
```

## Possible Types

https://www.apollographql.com/docs/apollo-server/schemas/types.html

**TL;DR:**

Int

Float

String

ID

Boolean
