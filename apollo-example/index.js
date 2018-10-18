const { ApolloServer, gql } = require('apollo-server');
const UsersAPI = require('./usersapi.js');
const TSEAPI = require('./tseapi.js');

// This is a (sample) collection of recipes.
const database = [
  {
    author: 'me',
    name: 'Torta de Frango',
    id: 'aaaa',
    steps: [
      {order: 1, description: 'Pegue a farinha'},
      {order: 2, description: 'Misture os ovos'},
      {order: 3, description: 'Mexa até ficar uma massa homogenea'},
    ]
  },
  {
    author: 'Joe',
    name: 'Pudim de Leite Condensado',
    id: 'bbbb',
    steps: [
      {order: 1, description: 'Pegue os ovos e misture com o leite condensado'},
      {order: 2, description: 'Bata no liquidificador por 5 minutos'},
      {order: 3, description: 'Coloque numa assadeira e leve ao forno'},
    ]
  }
];

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  # Enums
  enum Gender {
    male,
    female
  }

  # Inputs
  input CreateRecipeInput {
    name: String!
    ingredients: [String]!
    steps: [String]!
  }

  # Objects
  type Candidate {
    "Candidate Number"
    n: Int
    "Candidate Name"
    nm: String
    "Number of votes"
    v: Int
  }

  type CreateRecipePayload {
    recipe: Recipe
  }

  type Recipe {
    id: ID
    name: String
    steps: [Step]
  }

  type Step {
    order: Int
    description: String
  }

  type User {
    "male or female"
    gender: Gender
    email: String
    name: String
  }

  # Queries
  type Query {
    recipes(id: ID, author: String): [Recipe]
    randomUser: User
    votes: [Candidate!]
  }

  # Mutations
  type Mutation {
    createRecipe(recipe: CreateRecipeInput!): CreateRecipePayload
  }
`;

// Resolvers define the technique for fetching the types in the
// schema.
const resolvers = {
  Mutation: {
    createRecipe: (_source, _args) => {
      // Here, the right way is to save the data to database. For this example,
      // we'll just return the received data
      return {
        recipe: {
          id: Math.random().toString(36).substring(2, 6),
          name: _args.recipe.name,
          steps: _args.recipe.steps.map((item) => { return {description: item}})
        }
      }
    }
  },
  Query: {
    recipes: (_source, _args) => {
      if (_args.id) {
        return database.filter((item) => item.id === _args.id);
      }

      if (_args.author) {
        return database.filter((item) => item.author === _args.author);
      }

      return database;
    },
    randomUser: async (_source, _args, { dataSources }) => {
      let users = await dataSources.usersAPI.getUser();
      let user = users[0];

      return {
        ...user,
        name: user.name.first + ' ' + user.name.last
      };
    },
    votes: async (_source, _args, { dataSources }) => {
      return dataSources.tseAPI.getVotes();
    },
  }
};

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => {
    return {
      usersAPI: new UsersAPI(),
      tseAPI: new TSEAPI(),
    };
  },
});

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
