import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { getSavedBookIds } from '../utils/localStorage';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

const SavedBooks = () => {
  const { loading, data } = useQuery(GET_ME);
  const [removeBook, { error }] = useMutation(REMOVE_BOOK); // Using REMOVE_BOOK mutation

  const userData = data?.me || {};

  // Create a function to handle removing a book from the saved list
  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      await removeBook({
        variables: { bookId },
        update: cache => {
          const existingData = cache.readQuery({ query: GET_ME });
          const updatedBooks = existingData.me.savedBooks.filter(book => book.bookId !== bookId);
          cache.writeQuery({
            query: GET_ME,
            data: { me: { ...existingData.me, savedBooks: updatedBooks } },
          });
        }
      });

      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Container>
      <h2>{userData.savedBooks?.length ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length > 1 ? 'books' : 'book'}` : 'No saved books'}</h2>
      <Row xs={1} md={2} lg={3} className="g-3">
        {userData.savedBooks?.map((book) => (
          <Col key={book.bookId}>
            <Card>
              <Card.Body>
                <Card.Title>{book.title}</Card.Title>
                {/* Additional book details */}
                <Button variant="danger" onClick={() => handleDeleteBook(book.bookId)}>Delete from saved</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default SavedBooks;
