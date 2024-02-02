const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');
const { authMiddleware } = require('./utils/auth');
const path = require('path');
const cors = require('cors'); // Make sure to install cors package

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors()); // Enable all CORS requests

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
  introspection: true,
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

async function startApolloServer() {
  try {
    await server.start();
    server.applyMiddleware({ app, path: '/graphql' }); // Explicitly set the path for GraphQL

    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });

    db.once('open', () => {
      app.listen(PORT, () => {
        console.log(`🚀 API server running on port ${PORT}!`);
        console.log(`🔍 GraphQL Playground available at http://localhost:${PORT}/graphql`);
      });
    });
  } catch (error) {
    console.error('Server startup error:', error);
  }
}

startApolloServer();
