const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');
const { authMiddleware } = require('./utils/auth');
const path = require('path');

const PORT = process.env.PORT || 3001;
const app = express();

// Create an instance of ApolloServer
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

// Middleware for parsing JSON and urlencoded form data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve static assets (React application)
app.use(express.static(path.join(__dirname, '../client/dist')));

// Apollo Server setup with error handling
async function startApolloServer() {
  try {
    await server.start();
    server.applyMiddleware({ app });

    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });

    db.once('open', () => {
      app.listen(PORT, () => {
        console.log(`🚀 API server running on port ${PORT}!`);
        console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
      });
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
  }
}

startApolloServer();
