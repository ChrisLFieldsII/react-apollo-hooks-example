const { prisma } = require('./prisma/generated');
const { GraphQLServer } = require('graphql-yoga');

const resolvers = require('./src/resolvers');

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: {
    prisma,
  },
});

server.start({ port: 4001 }, () => console.log('Server is running on http://localhost:4001'));
